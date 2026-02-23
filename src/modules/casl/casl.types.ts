import type {
  accounts,
  medical_records,
  pets,
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
};
