import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetAmountDto } from './dto/update-budget.dto';
import { BudgetsRepository } from './budgets.repository';
import { BudgetTransactionsRepository } from '../budget-transactions/budget-transactions.repository';
import { accounts } from '@app/generated/prisma/client';
import dayjs from 'dayjs';
import { BudgetCategoriesRepository } from '../budget-categories/budget-categories.repository';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class BudgetsService {
  constructor(
    private readonly budgetsRepository: BudgetsRepository,
    private readonly budgetTransactionsRepository: BudgetTransactionsRepository,
    private readonly budgetCategoriesRepository: BudgetCategoriesRepository,
  ) {}
  async create(user: accounts, createBudgetDto: CreateBudgetDto) {
    const existing = await this.budgetsRepository.findUnique({
      account_id: user.id,
      month: createBudgetDto.month,
      year: createBudgetDto.year,
    });

    if (existing) {
      throw new ConflictException(
        `Budget for ${createBudgetDto.month}/${createBudgetDto.year} already exists.`,
      );
    }
    return this.budgetsRepository.create({
      account_id: user.id,
      amount: createBudgetDto.amount,
      month: createBudgetDto.month,
      year: createBudgetDto.year,
    });
  }

  async findOne(user: accounts, month: number, year: number) {
    let budget = await this.budgetsRepository.findUnique({
      account_id: user.id,
      month,
      year,
    });

    if (!budget) {
      budget = await this.budgetsRepository.create({
        account_id: user.id,
        amount: new Decimal(0),
        month,
        year,
      });
    }
    const time = dayjs()
      .year(budget.year)
      .month(budget.month - 1);
    const start = time.startOf('month').toDate();
    const end = time.endOf('month').toDate();

    const { amount } = await this.budgetTransactionsRepository.sum({
      account_id: user.id,
      start_date: start,
      end_date: end,
    });

    const spent = amount?.toNumber() ?? 0;
    const limit = budget.amount.toNumber();

    return {
      ...budget,
      amount: limit,
      spent,
      remaining: limit - spent,
      usagePercent: limit > 0 ? Math.round((spent / limit) * 100) : 0,
      isOverBudget: spent > limit,
    };
  }

  async updateAmount(user: accounts, updateBudgetDto: UpdateBudgetAmountDto) {
    const record = await this.budgetsRepository.findUnique({
      account_id: user.id,
      month: updateBudgetDto.month,
      year: updateBudgetDto.year,
    });

    if (!record) {
      throw new NotFoundException(
        `Budget for ${updateBudgetDto.month}/${updateBudgetDto.year} not found`,
      );
    }

    await this.budgetsRepository.updateAmount({
      amount: updateBudgetDto.amount,
      month: updateBudgetDto.month,
      year: updateBudgetDto.year,
      account_id: user.id,
    });
  }

  async getMonthlyStatistics(user: accounts, month: number, year: number) {
    const time = dayjs()
      .year(year)
      .month(month - 1);
    const start = time.startOf('month').toDate();
    const end = time.endOf('month').toDate();

    const { amount, count } = await this.budgetTransactionsRepository.sum({
      account_id: user.id,
      start_date: start,
      end_date: end,
    });

    const totalSpent = amount?.toNumber() ?? 0;

    const spendingByCategory = await this.getSpendingByCategory({
      user,
      endDate: end,
      startDate: start,
      totalSpent,
    });

    const transactions = await this.budgetTransactionsRepository.findAllByDate({
      account_id: user.id,
      end_date: end,
      start_date: start,
    });

    const dailyMap: Record<string, number> = {};

    for (const t of transactions) {
      const day = dayjs(t.date).format('YYYY-MM-DD'); // or dayjs(t.date).utc().format('YYYY-MM-DD') if you want UTC
      dailyMap[day] = (dailyMap[day] ?? 0) + Number(t.amount);
    }
    const dailyTrend = Object.entries(dailyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, amount]) => ({ date, amount }));

    return {
      period: { month, year },
      summary: {
        totalSpent,
        transactionCount: count,
      },
      spendingByCategory,
      dailyTrend,
    };
  }

  async getYearlyStatistics(user: accounts, year: number) {
    const time = dayjs().year(year);
    const start = time.startOf('year').toDate();
    const end = time.endOf('year').toDate();

    const { amount, count } = await this.budgetTransactionsRepository.sum({
      account_id: user.id,
      start_date: start,
      end_date: end,
    });

    const transactions = await this.budgetTransactionsRepository.findAllByDate({
      account_id: user.id,
      end_date: end,
      start_date: start,
    });

    const monthlyMap: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) monthlyMap[m] = 0;

    for (const t of transactions) {
      const m = t.date.getMonth() + 1;
      monthlyMap[m] += Number(t.amount);
    }

    const monthlyTrend = Object.entries(monthlyMap).map(([month, amount]) => ({
      month: Number(month),
      amount,
    }));

    const totalSpent = amount?.toNumber() ?? 0;

    const spendingByCategory = await this.getSpendingByCategory({
      endDate: end,
      startDate: start,
      totalSpent,
      user,
    });

    return {
      period: { year },
      summary: {
        totalSpent,
        transactionCount: count,
      },
      monthlyTrend,
      spendingByCategory,
    };
  }

  private async getSpendingByCategory(payload: {
    user: accounts;
    endDate: Date;
    startDate: Date;
    totalSpent: number;
  }) {
    const transactionAmountsByCategory =
      await this.budgetTransactionsRepository.sumGroupByCategory({
        account_id: payload.user.id,
        end_date: payload.endDate,
        start_date: payload.startDate,
      });

    const categories = await this.budgetCategoriesRepository.findManyByIds(
      transactionAmountsByCategory.map((b) => b.category_id),
    );
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

    const spendingByCategory = transactionAmountsByCategory
      .map((b) => ({
        category: categoryMap[b.category_id],
        total: Number(b._sum.amount),
        count: b._count,
        percentage:
          payload.totalSpent > 0
            ? Math.round((Number(b._sum.amount) / payload.totalSpent) * 100)
            : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return spendingByCategory;
  }
}
