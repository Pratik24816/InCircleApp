"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const database_config_1 = __importDefault(require("./config/database.config"));
const auth_config_1 = __importDefault(require("./config/auth.config"));
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const catalog_module_1 = require("./catalog/catalog.module");
const activities_module_1 = require("./activities/activities.module");
const reports_module_1 = require("./reports/reports.module");
const notifications_module_1 = require("./notifications/notifications.module");
const circle_feedback_module_1 = require("./circle-feedback/circle-feedback.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.default, auth_config_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('database.host'),
                    port: configService.get('database.port'),
                    username: configService.get('database.username'),
                    password: configService.get('database.password'),
                    database: configService.get('database.database'),
                    ssl: configService.get('database.ssl') ? { rejectUnauthorized: false } : false,
                    autoLoadEntities: true,
                    synchronize: false,
                }),
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            catalog_module_1.CatalogModule,
            activities_module_1.ActivitiesModule,
            reports_module_1.ReportsModule,
            notifications_module_1.NotificationsModule,
            circle_feedback_module_1.CircleFeedbackModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map