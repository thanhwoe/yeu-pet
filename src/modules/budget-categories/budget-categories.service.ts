import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBudgetCategoryDto } from './dto/create-budget-category.dto';
import { UpdateBudgetCategoryDto } from './dto/update-budget-category.dto';
import { BudgetCategoriesRepository } from './budget-categories.repository';
import { FileUploadService } from '../shared/file-upload/file-upload.service';
import {
  FILE_DELETE_JOBS,
  FILE_UPLOAD_JOBS,
} from '../file-workers/file-workers.job';

@Injectable()
export class BudgetCategoriesService {
  constructor(
    private readonly budgetCategoriesRepository: BudgetCategoriesRepository,
    private readonly fileUploadService: FileUploadService,
  ) {}
  async create(
    createBudgetCategoryDto: CreateBudgetCategoryDto,
    imageFile?: Express.Multer.File,
  ) {
    const category = await this.budgetCategoriesRepository.create({
      name: createBudgetCategoryDto.name,
      color: createBudgetCategoryDto.color,
    });

    if (imageFile) {
      await this.fileUploadService.addUploadJob({
        jobName: FILE_UPLOAD_JOBS.BUDGET_CATEGORIES,
        files: [
          {
            file: imageFile,
            folder: `budgets/categories/${category.id}`,
          },
        ],
        itemId: category.id,
      });
    }
    return category;
  }

  findAll() {
    return this.budgetCategoriesRepository.findAll();
  }

  async findOne(id: string) {
    const category = await this.budgetCategoriesRepository.findById(id);

    if (!category)
      throw new NotFoundException(`Budget category with ID ${id} not found`);
    return category;
  }

  async update(
    id: string,
    updateBudgetCategoryDto: UpdateBudgetCategoryDto,
    imageFile?: Express.Multer.File,
  ) {
    const category = await this.findOne(id);

    if (imageFile) {
      await this.fileUploadService.addUploadJob({
        jobName: FILE_UPLOAD_JOBS.BUDGET_CATEGORIES,
        files: [
          {
            file: imageFile,
            id: category.image_id,
            folder: `budgets/categories/${category.id}`,
          },
        ],
        itemId: category.id,
      });
    }
    return this.budgetCategoriesRepository.update(id, {
      color: updateBudgetCategoryDto.color,
      name: updateBudgetCategoryDto.name,
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    if (category.image_id) {
      await this.fileUploadService.addDeleteJob({
        ids: [category.image_id],
        jobName: FILE_DELETE_JOBS.BUDGET_CATEGORIES,
      });
    }
    await this.budgetCategoriesRepository.delete(id);
  }
}
