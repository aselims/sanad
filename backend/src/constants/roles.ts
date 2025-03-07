/**
 * Role constants for the application
 * This file serves as the single source of truth for role definitions
 */

// Admin role - special role for system administrators
export const ROLE_ADMIN = 'admin';

// Innovator types - different types of users who can register
export const INNOVATOR_TYPES = {
  STARTUP: 'startup',
  RESEARCH: 'research',
  CORPORATE: 'corporate',
  GOVERNMENT: 'government',
  INVESTOR: 'investor',
  INDIVIDUAL: 'individual',
  ORGANIZATION: 'organization',
} as const;

// Create a type from the object values
export type InnovatorType = typeof INNOVATOR_TYPES[keyof typeof INNOVATOR_TYPES];

// All roles including admin
export const ALL_ROLES = {
  ADMIN: ROLE_ADMIN,
  ...INNOVATOR_TYPES
} as const;

// Create a type from the object values
export type UserRoleType = typeof ALL_ROLES[keyof typeof ALL_ROLES];

// Array of innovator types for iteration (excluding admin)
export const INNOVATOR_TYPES_ARRAY = Object.values(INNOVATOR_TYPES);

// Array of all roles for iteration
export const ALL_ROLES_ARRAY = Object.values(ALL_ROLES);

// Check if a role is an innovator type
export const isInnovatorType = (role: string): role is InnovatorType => {
  return INNOVATOR_TYPES_ARRAY.includes(role as InnovatorType);
};

// User-friendly display names for roles
export const ROLE_DISPLAY_NAMES: Record<UserRoleType, string> = {
  [ROLE_ADMIN]: 'Administrator',
  [INNOVATOR_TYPES.STARTUP]: 'Startup',
  [INNOVATOR_TYPES.RESEARCH]: 'Research Institution',
  [INNOVATOR_TYPES.CORPORATE]: 'Corporate',
  [INNOVATOR_TYPES.GOVERNMENT]: 'Government',
  [INNOVATOR_TYPES.INVESTOR]: 'Investor',
  [INNOVATOR_TYPES.INDIVIDUAL]: 'Individual',
  [INNOVATOR_TYPES.ORGANIZATION]: 'Organization',
}; 