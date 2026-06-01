import { accounts, user_role } from '@app/generated/prisma/client';
import { ForbiddenException } from '@nestjs/common';

export function isAdmin(user: accounts): boolean {
  return user.role === user_role.admin;
}

export function isOwnerOrAdmin(user: accounts, ownerId: string): boolean {
  return isAdmin(user) || user.id === ownerId;
}

export function assertOwnerOrAdmin(user: accounts, ownerId: string): void {
  if (!isOwnerOrAdmin(user, ownerId)) {
    throw new ForbiddenException(
      'You do not have permission to access this resource',
    );
  }
}
