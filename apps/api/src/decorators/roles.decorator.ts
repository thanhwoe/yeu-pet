import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Require specific user roles to access a route.
 * @param roles List of required roles
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Require admin role to access a route.
 */
export const AdminOnly = () => SetMetadata(ROLES_KEY, ['admin']);
