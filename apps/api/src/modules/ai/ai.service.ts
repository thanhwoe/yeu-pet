import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  accounts,
  ai_message_role,
  ai_conversation_status,
  pets,
} from '@app/generated/prisma/client';
import { InputJsonValue } from '@app/generated/prisma/internal/prismaNamespace';
import { IAiConversationsRepository } from '@app/interfaces/ai-conversations-repository.interface';
import { IAiMessagesRepository } from '@app/interfaces/ai-messages-repository.interface';
import { IAiUsageLogsRepository } from '@app/interfaces/ai-usage-logs-repository.interface';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { IMedicalRecordsRepository } from '@app/interfaces/medical-records-repository.interface';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateAiConversationDto } from './dto/create-ai-conversation.dto';
import { CreateAiMessageDto } from './dto/create-ai-message.dto';
import { AiProviderMessage, AiProviderService } from './ai-provider.service';
import { AiSafetyService } from './ai-safety.service';

const SYSTEM_PROMPT = [
  'You are YeuPet Pet Care AI.',
  'Give concise, practical, general pet-care guidance.',
  'Never claim to provide an official diagnosis.',
  'For urgent or severe symptoms, tell the user to contact a veterinarian or emergency animal clinic immediately.',
].join(' ');

@Injectable()
export class AiService {
  constructor(
    @Inject(IAiConversationsRepository)
    private readonly conversationsRepository: IAiConversationsRepository,
    @Inject(IAiMessagesRepository)
    private readonly messagesRepository: IAiMessagesRepository,
    @Inject(IAiUsageLogsRepository)
    private readonly usageLogsRepository: IAiUsageLogsRepository,
    @Inject(IPetsRepository)
    private readonly petsRepository: IPetsRepository,
    @Inject(IMedicalRecordsRepository)
    private readonly medicalRecordsRepository: IMedicalRecordsRepository,
    private readonly subscriptionService: SubscriptionService,
    private readonly aiProviderService: AiProviderService,
    private readonly aiSafetyService: AiSafetyService,
  ) {}

  async createConversation(
    user: accounts,
    createConversationDto: CreateAiConversationDto,
  ) {
    const pet = await this.resolvePetContext(
      user.id,
      createConversationDto.petId,
    );

    return this.conversationsRepository.create({
      account_id: user.id,
      pet_id: pet?.id ?? null,
      title: createConversationDto.title ?? pet?.name ?? 'Pet care chat',
    });
  }

  async findAllConversations(user: accounts, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.conversationsRepository.findAll({
      account_id: user.id,
      skip,
      take: limit,
    });

    return paginate(data, total, page, limit);
  }

  async findMessages(
    user: accounts,
    conversationId: string,
    pagination: PaginationDto,
  ) {
    await this.findConversation(user.id, conversationId);

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.messagesRepository.findAll({
      conversation_id: conversationId,
      skip,
      take: limit,
    });

    return paginate(data, total, page, limit);
  }

  async sendMessage(
    user: accounts,
    conversationId: string,
    createMessageDto: CreateAiMessageDto,
  ) {
    const conversation = await this.findConversation(user.id, conversationId);

    await this.subscriptionService.assertCanUseAi(user.id);

    const entitlements = await this.subscriptionService.getEntitlements(
      user.id,
    );
    const pet = await this.resolveConversationPet(
      user.id,
      conversation.pet_id,
      entitlements.limits.aiWithPetContext,
    );
    const safety = this.aiSafetyService.assess(createMessageDto.content);
    const safetyFlags = this.toSafetyFlags(safety);

    const userMessage = await this.messagesRepository.create({
      conversation_id: conversation.id,
      account_id: user.id,
      role: ai_message_role.user,
      content: createMessageDto.content.trim(),
      safety_flags: safetyFlags,
    });

    const providerResult = safety.urgent
      ? {
          content: this.aiSafetyService.urgentResponse(),
          provider: 'safety',
          model: 'urgent-care-guard',
          inputTokens: 0,
          outputTokens: 0,
        }
      : await this.aiProviderService.generate(
          await this.buildProviderMessages(
            conversation.id,
            createMessageDto.content,
            pet,
            entitlements.limits.aiWithMedicalHistory,
          ),
        );

    const assistantMessage = await this.messagesRepository.create({
      conversation_id: conversation.id,
      account_id: user.id,
      role: ai_message_role.assistant,
      content: providerResult.content,
      provider: providerResult.provider,
      model: providerResult.model,
      input_tokens: providerResult.inputTokens,
      output_tokens: providerResult.outputTokens,
      safety_flags: safetyFlags,
    });

    await this.usageLogsRepository.create({
      account_id: user.id,
      conversation_id: conversation.id,
      provider: providerResult.provider,
      model: providerResult.model,
      input_tokens: providerResult.inputTokens ?? 0,
      output_tokens: providerResult.outputTokens ?? 0,
    });
    await this.subscriptionService.incrementUsage(user.id, 'ai_messages');

    return {
      assistantMessage,
      safety,
      userMessage,
    };
  }

  async deleteConversation(user: accounts, conversationId: string) {
    const result = await this.conversationsRepository.deleteByUser(
      user.id,
      conversationId,
    );

    if (result.count === 0) {
      throw new NotFoundException(
        `AI conversation ${conversationId} not found`,
      );
    }
  }

  private async resolvePetContext(accountId: string, petId?: string) {
    if (!petId) {
      return null;
    }

    const entitlements =
      await this.subscriptionService.getEntitlements(accountId);
    if (!entitlements.limits.aiWithPetContext) {
      throw new BadRequestException('Pet context for AI requires Premium');
    }

    const pet = await this.petsRepository.findByUser(accountId, petId);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found`);
    }

    return pet;
  }

  private async resolveConversationPet(
    accountId: string,
    petId: string | null,
    canUsePetContext: boolean,
  ) {
    if (!petId) {
      return null;
    }

    if (!canUsePetContext) {
      throw new BadRequestException('Pet context for AI requires Premium');
    }

    const pet = await this.petsRepository.findByUser(accountId, petId);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found`);
    }

    return pet;
  }

  private async findConversation(accountId: string, conversationId: string) {
    const conversation = await this.conversationsRepository.findByUser(
      accountId,
      conversationId,
    );

    if (
      !conversation ||
      conversation.status === ai_conversation_status.deleted
    ) {
      throw new NotFoundException(
        `AI conversation ${conversationId} not found`,
      );
    }

    return conversation;
  }

  private async buildProviderMessages(
    conversationId: string,
    userContent: string,
    pet: pets | null,
    canUseMedicalHistory: boolean,
  ): Promise<AiProviderMessage[]> {
    const recentMessages = await this.messagesRepository.findRecent(
      conversationId,
      8,
    );
    const context = await this.buildContext(pet, canUseMedicalHistory);

    return [
      {
        role: 'system',
        content: [SYSTEM_PROMPT, context].filter(Boolean).join('\n\n'),
      },
      ...recentMessages
        .reverse()
        .filter((message) => message.role !== ai_message_role.system)
        .map((message) => ({
          role: message.role as 'user' | 'assistant',
          content: message.content,
        })),
      {
        role: 'user',
        content: userContent,
      },
    ];
  }

  private async buildContext(pet: pets | null, canUseMedicalHistory: boolean) {
    if (!pet) {
      return '';
    }

    const petContext = [
      `Pet: ${pet.name}`,
      pet.species ? `Species: ${pet.species}` : null,
      pet.breed ? `Breed: ${pet.breed}` : null,
      pet.age ? `Age: ${pet.age}` : null,
      pet.weight_value
        ? `Weight: ${pet.weight_value.toString()} ${pet.weight_unit ?? ''}`
        : null,
      pet.notes ? `Notes: ${pet.notes}` : null,
    ].filter(Boolean);

    if (!canUseMedicalHistory) {
      return petContext.join('\n');
    }

    const [records] = await this.medicalRecordsRepository.findAll({
      pet_id: pet.id,
      take: 3,
    });
    const medicalContext = records.map((record) =>
      [
        record.record_type,
        record.title,
        record.description ? `- ${record.description}` : null,
      ]
        .filter(Boolean)
        .join(' '),
    );

    return [
      petContext.join('\n'),
      medicalContext.length
        ? `Recent medical records:\n${medicalContext.join('\n')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  private toSafetyFlags(safety: {
    urgent: boolean;
    flags: string[];
  }): InputJsonValue {
    return {
      flags: safety.flags,
      urgent: safety.urgent,
    };
  }
}
