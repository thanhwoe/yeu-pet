import { PartialType } from '@nestjs/swagger';
import { CreateBudgetCategoryDto } from './create-budget-category.dto';

export class UpdateBudgetCategoryDto extends PartialType(
  CreateBudgetCategoryDto,
) {}
