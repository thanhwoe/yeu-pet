import type {
  account_devices,
  accounts,
  budget_categories,
  budget_transactions,
  medical_records,
  notifications,
  pet_sitters,
  pets,
  photos,
  reminders,
} from '@app/generated/prisma/client';
import { PureAbility } from '@casl/ability';
import { PrismaQuery, Subjects } from '@casl/prisma';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type AppSubjects = Subjects<SubjectMap> | 'all';

export type AppAbility = PureAbility<[Action, AppSubjects], PrismaQuery>;

export type SubjectName = Exclude<Extract<AppSubjects, string>, 'all'>;

export type SubjectMap = {
  Pets: pets;
  Accounts: accounts;
  MedicalRecords: medical_records;
  UserDevices: account_devices;
  Reminders: reminders;
  Notifications: notifications;
  BudgetTransactions: budget_transactions;
  Photos: photos;
  PetSitters: pet_sitters;
  BudgetCategories: budget_categories;
};
