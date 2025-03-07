import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateForeignKeys1709800000000 implements MigrationInterface {
    name = 'UpdateForeignKeys1709800000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing foreign keys if they exist
        try {
            await queryRunner.query(`
                ALTER TABLE "challenges" 
                DROP CONSTRAINT IF EXISTS "FK_challenges_createdBy"
            `);
        } catch (error) {
            console.log('No FK_challenges_createdBy constraint to drop');
        }

        try {
            await queryRunner.query(`
                ALTER TABLE "partnerships" 
                DROP CONSTRAINT IF EXISTS "FK_partnerships_createdBy"
            `);
        } catch (error) {
            console.log('No FK_partnerships_createdBy constraint to drop');
        }

        // Drop createdBy column if it exists
        try {
            await queryRunner.query(`
                ALTER TABLE "challenges" 
                DROP COLUMN IF EXISTS "createdBy"
            `);
        } catch (error) {
            console.log('No createdBy column to drop in challenges');
        }

        try {
            await queryRunner.query(`
                ALTER TABLE "partnerships" 
                DROP COLUMN IF EXISTS "createdBy"
            `);
        } catch (error) {
            console.log('No createdBy column to drop in partnerships');
        }

        // Add foreign key constraints for createdById
        await queryRunner.query(`
            ALTER TABLE "challenges" 
            ADD CONSTRAINT "FK_challenges_createdById" 
            FOREIGN KEY ("createdById") 
            REFERENCES "users"("id") 
            ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "partnerships" 
            ADD CONSTRAINT "FK_partnerships_createdById" 
            FOREIGN KEY ("createdById") 
            REFERENCES "users"("id") 
            ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop new foreign keys
        await queryRunner.query(`
            ALTER TABLE "challenges" 
            DROP CONSTRAINT "FK_challenges_createdById"
        `);

        await queryRunner.query(`
            ALTER TABLE "partnerships" 
            DROP CONSTRAINT "FK_partnerships_createdById"
        `);
    }
} 