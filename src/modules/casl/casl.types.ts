import type { accounts, pets } from '@app/generated/prisma/client';
import { PureAbility } from '@casl/ability';
import { PrismaQuery, Subjects } from '@casl/prisma';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type AppSubjects =
  | Subjects<{
      Pets: pets;
      Accounts: accounts;
    }>
  | 'all';

export type AppAbility = PureAbility<[Action, AppSubjects], PrismaQuery>;

export type SubjectName = Exclude<Extract<AppSubjects, string>, 'all'>;

export type SubjectMap = {
  Pets: pets;
  Accounts: accounts;
};
