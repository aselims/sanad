import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAllowMessagesField1741440143607 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add allowMessages column with default value true
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'allowMessages',
        type: 'boolean',
        default: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop allowMessages column
    await queryRunner.dropColumn('users', 'allowMessages');
  }
} 