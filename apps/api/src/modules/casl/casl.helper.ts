import { ForbiddenException } from '@nestjs/common';
import { subject } from '@casl/ability';
import {
  AppAbility,
  Action,
  SubjectName,
  SubjectMap,
  AppSubjects,
} from './casl.types';

export function assertAbility<T extends SubjectName>(
  ability: AppAbility,
  action: Action,
  subjectType: T,
  record: SubjectMap[T],
): void {
  if (
    !ability.can(action, subject(subjectType, record) as unknown as AppSubjects)
  ) {
    throw new ForbiddenException(`Cannot ${action} this ${subjectType}`);
  }
}
