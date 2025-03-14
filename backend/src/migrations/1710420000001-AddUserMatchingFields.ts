import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserMatchingFields1710420000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add location column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'location',
        type: 'varchar',
        isNullable: true,
      })
    );

    // Add tags column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'tags',
        type: 'text',
        isNullable: true,
      })
    );

    // Add interests column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'interests',
        type: 'text',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop interests column
    await queryRunner.dropColumn('users', 'interests');
    
    // Drop tags column
    await queryRunner.dropColumn('users', 'tags');
    
    // Drop location column
    await queryRunner.dropColumn('users', 'location');
  }
} 