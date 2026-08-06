export const FOLLOWUP_PROCEDURES = [
  'Scanning',
  'Suture Remove',
  'Impression',
  'Deliver',
  'Stage 1',
  'Stage 2',
] as const;

export function getSuperAdminUsername(): string {
  return process.env.SUPER_ADMIN_USERNAME || 'Assad matoug';
}

export function getSuperAdminPassword(): string {
  return process.env.SUPER_ADMIN_PASSWORD || 'Assad5202320';
}

export function canManageUsers(username: string): boolean {
  return username === getSuperAdminUsername();
}
