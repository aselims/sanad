import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserRoleEnum1709780000000 implements MigrationInterface {
    name = 'UpdateUserRoleEnum1709780000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create a new type with all values
        await queryRunner.query(`
            CREATE TYPE "users_role_enum_new" AS ENUM(
                'admin', 
                'innovator', 
                'organization', 
                'startup', 
                'research', 
                'corporate', 
                'government', 
                'investor', 
                'individual'
            )
        `);

        // Update the column to use the new type
        // First, create a temporary column with the new type
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "role_new" "users_role_enum_new" NOT NULL DEFAULT 'innovator'
        `);

        // Copy data from old column to new column with type casting
        await queryRunner.query(`
            UPDATE "users" 
            SET "role_new" = "role"::text::"users_role_enum_new"
        `);

        // Drop the old column
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "role"
        `);

        // Rename the new column to the original name
        await queryRunner.query(`
            ALTER TABLE "users" 
            RENAME COLUMN "role_new" TO "role"
        `);

        // Drop the old type
        await queryRunner.query(`
            DROP TYPE "users_role_enum"
        `);

        // Rename the new type to the original name
        await queryRunner.query(`
            ALTER TYPE "users_role_enum_new" 
            RENAME TO "users_role_enum"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Create the original type
        await queryRunner.query(`
            CREATE TYPE "users_role_enum_old" AS ENUM(
                'admin', 
                'innovator', 
                'organization'
            )
        `);

        // Update the column to use the original type
        // First, create a temporary column with the original type
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "role_old" "users_role_enum_old" NOT NULL DEFAULT 'innovator'
        `);

        // Copy data from current column to old column with type casting
        // This will fail for records with new role values, so we set them to 'innovator'
        await queryRunner.query(`
            UPDATE "users" 
            SET "role_old" = 
                CASE 
                    WHEN "role"::text IN ('admin', 'innovator', 'organization') 
                    THEN "role"::text::"users_role_enum_old" 
                    ELSE 'innovator'::"users_role_enum_old" 
                END
        `);

        // Drop the current column
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "role"
        `);

        // Rename the old column to the original name
        await queryRunner.query(`
            ALTER TABLE "users" 
            RENAME COLUMN "role_old" TO "role"
        `);

        // Drop the current type
        await queryRunner.query(`
            DROP TYPE "users_role_enum"
        `);

        // Rename the old type to the original name
        await queryRunner.query(`
            ALTER TYPE "users_role_enum_old" 
            RENAME TO "users_role_enum"
        `);
    }
} 