import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBudgetTransactionDto } from './dto/create-budget-transaction.dto';
import { UpdateBudgetTransactionDto } from './dto/update-budget-transaction.dto';
import { accounts } from '@app/generated/prisma/client';
import dayjs from 'dayjs';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';
import { IBudgetTransactionsRepository } from '@app/interfaces/budget-transactions-repository.interface';
import { assertOwnerOrAdmin } from '@app/utils/ownership';
import { IBudgetCategoriesRepository } from '@app/interfaces/budget-categories-repository.interface';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { SubscriptionService } from '../../subscription/subscription.service';

@Injectable()
export class BudgetTransactionsService {
  constructor(
    @Inject(IBudgetTransactionsRepository)
    private readonly budgetTransactionsRepository: IBudgetTransactionsRepository,
    @Inject(IBudgetCategoriesRepository)
    private readonly budgetCategoriesRepository: IBudgetCategoriesRepository,
    @Inject(IPetsRepository)
    private readonly petsRepository: IPetsRepository,
    private readonly subscriptionService: SubscriptionService,
  ) {}
  async create(
    user: accounts,
    createBudgetTransactionDto: CreateBudgetTransactionDto,
  ) {
    this.assertPositiveAmount(createBudgetTransactionDto.amount);
    await this.assertCategoryOwner(user, createBudgetTransactionDto.categoryId);

    if (createBudgetTransactionDto.petId) {
      await this.assertPetOwner(user.id, createBudgetTransactionDto.petId);
    }

    const date = dayjs(createBudgetTransactionDto.date).toDate();
    await this.subscriptionService.assertCanCreateBudgetTransaction(
      user.id,
      date,
    );

    return this.budgetTransactionsRepository.create({
      accounts: {
        connect: {
          id: user.id,
        },
      },
      budget_categories: {
        connect: {
          id: createBudgetTransactionDto.categoryId,
        },
      },
      pets: createBudgetTransactionDto.petId
        ? {
            connect: {
              id: createBudgetTransactionDto.petId,
            },
          }
        : undefined,
      amount: createBudgetTransactionDto.amount,
      date,
      description: createBudgetTransactionDto.description,
    });
  }

  async findAll(
    user: accounts,
    pagination: PaginationDto,
    month?: number,
    year?: number,
    categoryId?: string,
    petId?: string,
  ) {
    if (categoryId) {
      await this.assertCategoryOwner(user, categoryId);
    }
    if (petId) {
      await this.assertPetOwner(user.id, petId);
    }

    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    if (year && month) {
      const time = dayjs()
        .year(year)
        .month(month - 1);
      const start = time.startOf('month').toDate();
      const end = time.endOf('month').toDate();
      const [data, total] = await this.budgetTransactionsRepository.findAll({
        account_id: user.id,
        category_id: categoryId,
        pet_id: petId,
        skip,
        take: limit,
        endDate: end,
        startDate: start,
      });
      return paginate(data, total, page, limit);
    }

    const [data, total] = await this.budgetTransactionsRepository.findAll({
      account_id: user.id,
      category_id: categoryId,
      pet_id: petId,
      skip,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  async update(
    user: accounts,
    id: string,
    updateBudgetTransactionDto: UpdateBudgetTransactionDto,
  ) {
    await this.assertOwner(user, id);
    if (updateBudgetTransactionDto.amount) {
      this.assertPositiveAmount(updateBudgetTransactionDto.amount);
    }
    if (updateBudgetTransactionDto.categoryId) {
      await this.assertCategoryOwner(
        user,
        updateBudgetTransactionDto.categoryId,
      );
    }
    if (updateBudgetTransactionDto.petId) {
      await this.assertPetOwner(user.id, updateBudgetTransactionDto.petId);
    }

    return this.budgetTransactionsRepository.update(id, {
      budget_categories: updateBudgetTransactionDto.categoryId
        ? {
            connect: {
              id: updateBudgetTransactionDto.categoryId,
            },
          }
        : undefined,
      pets: updateBudgetTransactionDto.petId
        ? {
            connect: {
              id: updateBudgetTransactionDto.petId,
            },
          }
        : undefined,
      amount: updateBudgetTransactionDto.amount,
      date: updateBudgetTransactionDto.date
        ? dayjs(updateBudgetTransactionDto.date).toDate()
        : undefined,
      description: updateBudgetTransactionDto.description,
    });
  }

  async remove(user: accounts, id: string) {
    await this.assertOwner(user, id);
    await this.budgetTransactionsRepository.delete(id);
  }

  private async assertOwner(user: accounts, id: string) {
    const record = await this.budgetTransactionsRepository.findById(id);

    if (!record)
      throw new NotFoundException(`Budget transaction with ID ${id} not found`);

    assertOwnerOrAdmin(user, record.account_id);

    return record;
  }

  private async assertCategoryOwner(user: accounts, id: string) {
    const record = await this.budgetCategoriesRepository.findById(id);

    if (!record) {
      throw new NotFoundException(`Budget category with ID ${id} not found`);
    }

    assertOwnerOrAdmin(user, record.account_id);

    return record;
  }

  private async assertPetOwner(userId: string, id: string) {
    const pet = await this.petsRepository.findByUser(userId, id);

    if (!pet) {
      throw new NotFoundException(
        `Pet with ID ${id} not found or does not belong to you`,
      );
    }

    return pet;
  }

  private assertPositiveAmount(amount: CreateBudgetTransactionDto['amount']) {
    if (amount.lte(0)) {
      throw new BadRequestException('Amount must be positive');
    }
  }
}
