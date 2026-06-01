import { Injectable } from '@nestjs/common';
import { AbilityBuilder } from '@casl/ability';
import { Action, AppAbility } from './casl.types';
import { accounts, user_role } from '@app/generated/prisma/client';
import { createPrismaAbility } from '@casl/prisma';

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: accounts): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    if (user.role === user_role.admin) {
      can(Action.Manage, 'all');
    } else {
      can(Action.Create, 'Pets');

      can(Action.Create, 'MedicalRecords');

      can(Action.Create, 'UserDevices');
      can(Action.Read, 'UserDevices', { account_id: user.id });
      can(Action.Delete, 'UserDevices', { account_id: user.id });

      can(Action.Create, 'Reminders');

      can(Action.Update, 'Notifications', { account_id: user.id });
      can(Action.Delete, 'Notifications', { account_id: user.id });

      can(Action.Create, 'BudgetTransactions');

      can(Action.Create, 'BudgetCategories');

      can(Action.Create, 'Photos');

      can(Action.Create, 'PetSitters');
    }

    return build();
  }
}
