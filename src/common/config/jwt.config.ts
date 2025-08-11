export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key',
  accessTokenExpire: process.env.JWT_EXPIRE_TIME || '15m',
  refreshTokenExpireDays: Number(process.env.JWT_REFRESH_EXPIRE_DAYS) || 7,
};