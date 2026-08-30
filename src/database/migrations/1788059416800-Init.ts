import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1788059416800 implements MigrationInterface {
    name = 'Init1788059416800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" text NOT NULL, "description" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_019d74f7abcdcb5a0113010cb0" ON "services" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_2f9dc5b3a2c915e0a7595f58eb" ON "services" ("created_at") `);
        await queryRunner.query(`CREATE TABLE "versions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "service_id" uuid NOT NULL, "version" text NOT NULL, "changelog" text NOT NULL, "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_921e9a820c96cc2cd7d4b3a107b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c7094730dad6c4ccc88aca84c2" ON "versions" ("service_id", "version") `);
        await queryRunner.query(`ALTER TABLE "versions" ADD CONSTRAINT "FK_961b0fd5ea2634e21a6ef6faed7" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "versions" DROP CONSTRAINT "FK_961b0fd5ea2634e21a6ef6faed7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c7094730dad6c4ccc88aca84c2"`);
        await queryRunner.query(`DROP TABLE "versions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2f9dc5b3a2c915e0a7595f58eb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_019d74f7abcdcb5a0113010cb0"`);
        await queryRunner.query(`DROP TABLE "services"`);
    }

}
