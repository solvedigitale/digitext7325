// src/constants/roles.ts
export const ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent'
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'dashboard:view',
    'analytics:view',
    'api:manage',
    'webhooks:manage',
    'users:manage',
    'security:manage',
    'notifications:manage',
    'logs:view',
    'templates:manage',
    'settings:manage'
  ],
  [ROLES.AGENT]: [
    'dashboard:view',
    'chat:respond',
    'templates:view',
    'analytics:view:self'
  ]
};

// Kullanıcı rolüne göre izinleri döndürür
export const getPermissionsByRole = (role = ROLES.ADMIN) => {
  return PERMISSIONS[role] || [];
};