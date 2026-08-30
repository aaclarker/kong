import { SetMetadata } from '@nestjs/common';
import { Role } from './role.enum';

export const ROLES_KEY = 'roles';

// Restrict to the given roles; none = any authenticated caller.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
