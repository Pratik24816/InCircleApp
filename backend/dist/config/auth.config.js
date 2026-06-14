"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('auth', () => ({
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'your_jwt_access_secret_should_be_long_and_secure_at_least_32_chars',
    jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_should_be_long_and_secure_at_least_32_chars',
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    googleClientIdIos: process.env.GOOGLE_CLIENT_ID_IOS || '',
    googleClientIdAndroid: process.env.GOOGLE_CLIENT_ID_ANDROID || '',
    googleClientIdWeb: process.env.GOOGLE_CLIENT_ID_WEB || '',
}));
//# sourceMappingURL=auth.config.js.map