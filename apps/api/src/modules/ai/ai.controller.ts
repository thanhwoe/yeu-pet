import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import { IdParam } from '@app/decorators/id-param.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { PaginationQuery } from '@app/decorators/pagination.decorator';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { AiService } from './ai.service';
import { CreateAiConversationDto } from './dto/create-ai-conversation.dto';
import { CreateAiMessageDto } from './dto/create-ai-message.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('conversations')
  @HttpCode(HttpStatus.OK)
  findAllConversations(
    @CurrentUser() user: accounts,
    @PaginationQuery() pagination: PaginationDto,
  ) {
    return this.aiService.findAllConversations(user, pagination);
  }

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  createConversation(
    @CurrentUser() user: accounts,
    @Body() createConversationDto: CreateAiConversationDto,
  ) {
    return this.aiService.createConversation(user, createConversationDto);
  }

  @Get('conversations/:id/messages')
  @HttpCode(HttpStatus.OK)
  findMessages(
    @CurrentUser() user: accounts,
    @IdParam() id: string,
    @PaginationQuery() pagination: PaginationDto,
  ) {
    return this.aiService.findMessages(user, id, pagination);
  }

  @Post('conversations/:id/messages/stream')
  async streamMessage(
    @CurrentUser() user: accounts,
    @IdParam() id: string,
    @Body() createMessageDto: CreateAiMessageDto,
    @Res() response: Response,
  ) {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    const result = await this.aiService.sendMessage(user, id, createMessageDto);

    this.writeEvent(response, 'message', {
      content: result.assistantMessage.content,
      safety: result.safety,
    });
    this.writeEvent(response, 'done', {
      assistantMessage: result.assistantMessage,
      userMessage: result.userMessage,
    });
    response.end();
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteConversation(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.aiService.deleteConversation(user, id);
  }

  private writeEvent(response: Response, event: string, data: unknown) {
    response.write(`event: ${event}\n`);
    response.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}
