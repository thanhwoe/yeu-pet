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
      can(Action.Read, 'Pets', { account_id: user.id });
      can(Action.Update, 'Pets', { account_id: user.id });
      can(Action.Delete, 'Pets', { account_id: user.id });

      // Check user permission through action pet read
      can(Action.Create, 'MedicalRecords');
      can(Action.Read, 'MedicalRecords');
      can(Action.Update, 'MedicalRecords');
      can(Action.Delete, 'MedicalRecords');
    }

    return build();
  }
}
