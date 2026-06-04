import {
  ai_conversation_status,
  ai_message_role,
  weight_unit,
} from '@app/generated/prisma/client';
import { IAiConversationsRepository } from '@app/interfaces/ai-conversations-repository.interface';
import { IAiMessagesRepository } from '@app/interfaces/ai-messages-repository.interface';
import { IAiUsageLogsRepository } from '@app/interfaces/ai-usage-logs-repository.interface';
import { IMedicalRecordsRepository } from '@app/interfaces/medical-records-repository.interface';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Decimal } from '@prisma/client/runtime/client';
import { SubscriptionService } from '../subscription/subscription.service';
import { AiProviderService } from './ai-provider.service';
import { AiSafetyService } from './ai-safety.service';
import { AiService } from './ai.service';

describe('AiService', () => {
  const conversationsRepository = {
    create: jest.fn(),
    deleteByUser: jest.fn(),
    findAll: jest.fn(),
    findByUser: jest.fn(),
  };
  const messagesRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findRecent: jest.fn(),
  };
  const usageLogsRepository = {
    create: jest.fn(),
  };
  const petsRepository = {
    findByUser: jest.fn(),
  };
  const medicalRecordsRepository = {
    findAll: jest.fn(),
  };
  const subscriptionService = {
    assertCanUseAi: jest.fn(),
    getEntitlements: jest.fn(),
    incrementUsage: jest.fn(),
  };
  const aiProviderService = {
    generate: jest.fn(),
  };

  let service: AiService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AiService,
        AiSafetyService,
        {
          provide: IAiConversationsRepository,
          useValue: conversationsRepository,
        },
        { provide: IAiMessagesRepository, useValue: messagesRepository },
        { provide: IAiUsageLogsRepository, useValue: usageLogsRepository },
        { provide: IPetsRepository, useValue: petsRepository },
        {
          provide: IMedicalRecordsRepository,
          useValue: medicalRecordsRepository,
        },
        { provide: SubscriptionService, useValue: subscriptionService },
        { provide: AiProviderService, useValue: aiProviderService },
      ],
    }).compile();

    service = moduleRef.get(AiService);

    subscriptionService.getEntitlements.mockResolvedValue({
      limits: {
        aiWithMedicalHistory: true,
        aiWithPetContext: true,
      },
    });
    messagesRepository.create.mockImplementation((data: unknown) =>
      Promise.resolve({
        id:
          (data as { role: ai_message_role }).role === ai_message_role.user
            ? 'user-message-1'
            : 'assistant-message-1',
        ...(data as object),
      }),
    );
    messagesRepository.findRecent.mockResolvedValue([]);
    medicalRecordsRepository.findAll.mockResolvedValue([[], 0]);
  });

  it('requires Premium for pet-context conversations', async () => {
    subscriptionService.getEntitlements.mockResolvedValue({
      limits: {
        aiWithPetContext: false,
      },
    });

    await expect(
      service.createConversation({ id: 'account-1' } as never, {
        petId: 'pet-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates pet-context conversations after ownership checks', async () => {
    petsRepository.findByUser.mockResolvedValue({
      id: 'pet-1',
      name: 'Mochi',
    });
    conversationsRepository.create.mockResolvedValue({ id: 'conversation-1' });

    await service.createConversation({ id: 'account-1' } as never, {
      petId: 'pet-1',
    });

    expect(petsRepository.findByUser).toHaveBeenCalledWith(
      'account-1',
      'pet-1',
    );
    expect(conversationsRepository.create).toHaveBeenCalledWith({
      account_id: 'account-1',
      pet_id: 'pet-1',
      title: 'Mochi',
    });
  });

  it('stores urgent safety responses without calling the provider', async () => {
    conversationsRepository.findByUser.mockResolvedValue({
      id: 'conversation-1',
      account_id: 'account-1',
      pet_id: null,
      status: ai_conversation_status.active,
    });

    const result = await service.sendMessage(
      { id: 'account-1' } as never,
      'conversation-1',
      {
        content: 'My dog is having a seizure',
      },
    );

    expect(subscriptionService.assertCanUseAi).toHaveBeenCalledWith(
      'account-1',
    );
    expect(aiProviderService.generate).not.toHaveBeenCalled();
    expect(result.safety.urgent).toBe(true);
    expect(String(result.assistantMessage.content)).toContain('veterinarian');
    expect(result.assistantMessage.provider).toBe('safety');
    expect(subscriptionService.incrementUsage).toHaveBeenCalledWith(
      'account-1',
      'ai_messages',
    );
  });

  it('builds premium pet and medical context for provider responses', async () => {
    conversationsRepository.findByUser.mockResolvedValue({
      id: 'conversation-1',
      account_id: 'account-1',
      pet_id: 'pet-1',
      status: ai_conversation_status.active,
    });
    petsRepository.findByUser.mockResolvedValue({
      id: 'pet-1',
      name: 'Mochi',
      species: 'dog',
      breed: 'Poodle',
      age: 3,
      weight_value: new Decimal(4.5),
      weight_unit: weight_unit.kg,
      notes: 'Sensitive stomach',
    });
    medicalRecordsRepository.findAll.mockResolvedValue([
      [
        {
          record_type: 'vaccination',
          title: 'Rabies vaccine',
          description: 'Annual shot',
        },
      ],
      1,
    ]);
    let providerMessages:
      | {
          content: string;
          role: string;
        }[]
      | undefined;
    aiProviderService.generate.mockImplementation((messages: unknown) => {
      providerMessages = messages as {
        content: string;
        role: string;
      }[];

      return Promise.resolve({
        content: 'General care response',
        inputTokens: 12,
        model: 'test-model',
        outputTokens: 6,
        provider: 'test-provider',
      });
    });

    await service.sendMessage({ id: 'account-1' } as never, 'conversation-1', {
      content: 'What food is safe?',
    });

    expect(providerMessages?.[0]).toMatchObject({ role: 'system' });
    expect(providerMessages?.[0]?.content).toContain('Recent medical records');
    expect(usageLogsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'test-model',
        provider: 'test-provider',
      }),
    );
  });
});
