"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserTable1718364000000 = void 0;
class CreateUserTable1718364000000 {
    name = 'CreateUserTable1718364000000';
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "username" character varying,
        "fullName" character varying NOT NULL,
        "bio" text,
        "googleId" character varying NOT NULL,
        "googlePhotoUrl" text,
        "customPhotoUrl" text,
        "hashedRefreshToken" text,
        "isProfileCompleted" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_97672ac88f108f1110cf5601285" UNIQUE ("email"),
        CONSTRAINT "UQ_99bb092b0fa17d98bd27f54c30c" UNIQUE ("username"),
        CONSTRAINT "UQ_googleId" UNIQUE ("googleId")
      )
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_97672ac88f108f1110cf560128" ON "users" ("email")
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_99bb092b0fa17d98bd27f54c30" ON "users" ("username") WHERE "username" IS NOT NULL
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_googleId" ON "users" ("googleId")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "users"."IDX_googleId"`);
        await queryRunner.query(`DROP INDEX "users"."IDX_99bb092b0fa17d98bd27f54c30"`);
        await queryRunner.query(`DROP INDEX "users"."IDX_97672ac88f108f1110cf560128"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
exports.CreateUserTable1718364000000 = CreateUserTable1718364000000;
//# sourceMappingURL=1718364000000-CreateUserTable.js.map