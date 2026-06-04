import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import { IdParam } from '@app/decorators/id-param.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { PaginationQuery } from '@app/decorators/pagination.decorator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { CreateSitterBookingMessageDto } from './dto/create-sitter-booking-message.dto';
import { SitterBookingMessagesService } from './sitter-booking-messages.service';

@Controller('sitter-bookings/:id/messages')
export class SitterBookingMessagesController {
  constructor(
    private readonly sitterBookingMessagesService: SitterBookingMessagesService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @CurrentUser() user: accounts,
    @IdParam() bookingId: string,
    @PaginationQuery() pagination: PaginationDto,
  ) {
    return this.sitterBookingMessagesService.findAll(
      user,
      bookingId,
      pagination,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: accounts,
    @IdParam() bookingId: string,
    @Body() createMessageDto: CreateSitterBookingMessageDto,
  ) {
    return this.sitterBookingMessagesService.create(
      user,
      bookingId,
      createMessageDto,
    );
  }
}
