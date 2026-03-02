import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BudgetCategoriesService } from './budget-categories.service';
import { CreateBudgetCategoryDto } from './dto/create-budget-category.dto';
import { UpdateBudgetCategoryDto } from './dto/update-budget-category.dto';
import { IdParam } from '@app/decorators/id-param.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploaded } from '@app/decorators/file-uploaded.decorator';
import { AdminOnly } from '@app/decorators/admin.decorator';

@Controller('budgets/categories')
export class BudgetCategoriesController {
  constructor(
    private readonly budgetCategoriesService: BudgetCategoriesService,
  ) {}

  @Post()
  @AdminOnly()
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createBudgetCategoryDto: CreateBudgetCategoryDto,
    @FileUploaded()
    image?: Express.Multer.File,
  ) {
    return this.budgetCategoriesService.create(createBudgetCategoryDto, image);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.budgetCategoriesService.findAll();
  }

  @Patch(':id')
  @AdminOnly()
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.OK)
  update(
    @IdParam() id: string,
    @Body() updateBudgetCategoryDto: UpdateBudgetCategoryDto,
    @FileUploaded()
    image?: Express.Multer.File,
  ) {
    return this.budgetCategoriesService.update(
      id,
      updateBudgetCategoryDto,
      image,
    );
  }

  @Delete(':id')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@IdParam('id') id: string) {
    return this.budgetCategoriesService.remove(id);
  }
}
