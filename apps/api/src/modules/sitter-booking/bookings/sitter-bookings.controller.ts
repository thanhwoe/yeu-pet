import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SitterBookingsService } from './sitter-bookings.service';
import { CreateSitterBookingDto } from './dto/create-sitter-booking.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import {
  type accounts,
  sitter_bookings_status,
} from '@app/generated/prisma/client';
import { IdParam } from '@app/decorators/id-param.decorator';
import { CancelSitterBookingDto } from './dto/cancel-sitter-booking.dto';
import { PaginationQuery } from '@app/decorators/pagination.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { AllowValuesPipe } from '@app/pipes/allow-values.pipe';

@Controller('sitter-bookings')
export class SitterBookingsController {
  constructor(private readonly sitterBookingsService: SitterBookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: accounts,
    @Body() createSitterBookingDto: CreateSitterBookingDto,
  ) {
    return this.sitterBookingsService.create(user, createSitterBookingDto);
  }

  @Patch(':id/confirm')
  @HttpCode(HttpStatus.OK)
  confirm(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.sitterBookingsService.confirm(user, id);
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  reject(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.sitterBookingsService.reject(user, id);
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  complete(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.sitterBookingsService.complete(user, id);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(
    @CurrentUser() user: accounts,
    @IdParam() id: string,
    @Body() cancelSitterBookingDto: CancelSitterBookingDto,
  ) {
    return this.sitterBookingsService.cancel(user, id, cancelSitterBookingDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @CurrentUser() user: accounts,
    @PaginationQuery() pagination: PaginationDto,
    @Query('status', new AllowValuesPipe(sitter_bookings_status))
    status?: sitter_bookings_status,
  ) {
    return this.sitterBookingsService.findAll(user, pagination, status);
  }

  @Get('sitter')
  @HttpCode(HttpStatus.OK)
  findAllBySitter(
    @CurrentUser() user: accounts,
    @PaginationQuery() pagination: PaginationDto,
    @Query('status', new AllowValuesPipe(sitter_bookings_status))
    status?: sitter_bookings_status,
  ) {
    return this.sitterBookingsService.findAllBySitter(user, pagination, status);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.sitterBookingsService.findOne(user, id);
  }
}
