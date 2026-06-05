import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import { PaginationQuery } from '@app/decorators/pagination.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { ModerationService } from './moderation.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: accounts,
    @Body() createReportDto: CreateReportDto,
  ) {
    return this.moderationService.createReport(user, createReportDto);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  findMine(
    @CurrentUser() user: accounts,
    @PaginationQuery() pagination: PaginationDto,
  ) {
    return this.moderationService.findMyReports(user, pagination);
  }
}
