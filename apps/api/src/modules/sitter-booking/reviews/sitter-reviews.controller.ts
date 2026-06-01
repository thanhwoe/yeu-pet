import { Controller, Get, Post, Body } from '@nestjs/common';
import { SitterReviewsService } from './sitter-reviews.service';
import { CreateSitterReviewDto } from './dto/create-sitter-review.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { IdParam } from '@app/decorators/id-param.decorator';
import { PaginationQuery } from '@app/decorators/pagination.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Controller('sitter-reviews')
export class SitterReviewsController {
  constructor(private readonly sitterReviewsService: SitterReviewsService) {}

  @Post()
  create(
    @CurrentUser() user: accounts,
    @Body() createSitterReviewDto: CreateSitterReviewDto,
  ) {
    return this.sitterReviewsService.create(user, createSitterReviewDto);
  }

  @Get(':sitterId')
  findAll(
    @IdParam('sitterId') id: string,
    @PaginationQuery() pagination: PaginationDto,
  ) {
    return this.sitterReviewsService.findAll(id, pagination);
  }
}
