import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BudgetCategoriesService } from './budget-categories.service';
import { CreateBudgetCategoryDto } from './dto/create-budget-category.dto';
import { UpdateBudgetCategoryDto } from './dto/update-budget-category.dto';
import { IdParam } from '@app/decorators/id-param.decorator';
import { PaginationQuery } from '@app/decorators/pagination.decorator';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import type { accounts } from '@app/generated/prisma/client';

@Controller('budgets/categories')
export class BudgetCategoriesController {
  constructor(
    private readonly budgetCategoriesService: BudgetCategoriesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: accounts,
    @Body() createBudgetCategoryDto: CreateBudgetCategoryDto,
  ) {
    return this.budgetCategoriesService.create(user, createBudgetCategoryDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@PaginationQuery() pagination: PaginationDto) {
    return this.budgetCategoriesService.findAll(pagination);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @CurrentUser() user: accounts,
    @IdParam() id: string,
    @Body() updateBudgetCategoryDto: UpdateBudgetCategoryDto,
  ) {
    return this.budgetCategoriesService.update(
      user,
      id,
      updateBudgetCategoryDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.budgetCategoriesService.remove(user, id);
  }
}
