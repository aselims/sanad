import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class Phase2InvestmentPipeline1724519200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create investors table
    await queryRunner.createTable(
      new Table({
        name: 'investors',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'investor_type',
            type: 'enum',
            enum: ['angel', 'vc', 'corporate', 'family_office'],
          },
          {
            name: 'firm_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'website',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'logo',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'contact_email',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'contact_phone',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'contact_person',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'timezone',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'focus_areas',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'stage_preference',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'geographic_focus',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'min_investment',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'max_investment',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'enum',
            enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SAR', 'AED'],
            default: "'USD'",
          },
          {
            name: 'industries',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'business_models',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'investment_philosophy',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'portfolio_size',
            type: 'int',
            default: 0,
          },
          {
            name: 'active_investments',
            type: 'int',
            default: 0,
          },
          {
            name: 'average_ticket_size',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'total_invested',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'notable_exits',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'is_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'verification_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'verified_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'response_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'investments_made',
            type: 'int',
            default: 0,
          },
          {
            name: 'last_active',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'profile_views',
            type: 'int',
            default: 0,
          },
          {
            name: 'accepting_pitches',
            type: 'boolean',
            default: true,
          },
          {
            name: 'preferred_contact_method',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'availability_hours',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'time_to_decision_weeks',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'required_documents',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'investment_committee',
            type: 'boolean',
            default: false,
          },
          {
            name: 'board_seat_required',
            type: 'boolean',
            default: false,
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'internal_rating',
            type: 'decimal',
            precision: 3,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );

    // Create investments table
    await queryRunner.createTable(
      new Table({
        name: 'investments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'investor_id',
            type: 'uuid',
          },
          {
            name: 'project_id',
            type: 'uuid',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['interested', 'reviewing', 'due_diligence', 'term_sheet', 'negotiation', 'closed', 'rejected', 'withdrawn'],
            default: "'interested'",
          },
          {
            name: 'investment_type',
            type: 'enum',
            enum: ['equity', 'convertible_note', 'safe', 'debt', 'revenue_share'],
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'enum',
            enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SAR', 'AED'],
            default: "'USD'",
          },
          {
            name: 'valuation',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'equity_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'initial_interest_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'due_diligence_start_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'term_sheet_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'closing_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'expected_closing_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'lead_source',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'introduction_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'first_meeting_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_contact_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'interest_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'conversion_cap',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'discount_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'board_seat',
            type: 'boolean',
            default: false,
          },
          {
            name: 'liquidation_preference',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'special_rights',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'due_diligence_items',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'due_diligence_completed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'due_diligence_completion_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'documents',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'required_documents',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'meeting_history',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'platform_fee_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'platform_fee_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'success_fee_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'rejection_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'rejection_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'withdrawal_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'withdrawal_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'post_money_valuation',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'current_valuation',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'exit_valuation',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'exit_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'exit_type',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );

    // Create indexes for investors table
    await queryRunner.createIndex(
      'investors',
      new TableIndex({
        name: 'IDX_investors_type_verified',
        columnNames: ['investor_type', 'is_verified']
      })
    );
    
    await queryRunner.createIndex(
      'investors',
      new TableIndex({
        name: 'IDX_investors_investment_range',
        columnNames: ['min_investment', 'max_investment']
      })
    );
    
    await queryRunner.createIndex(
      'investors',
      new TableIndex({
        name: 'IDX_investors_focus_areas',
        columnNames: ['focus_areas']
      })
    );

    await queryRunner.createIndex(
      'investors',
      new TableIndex({
        name: 'IDX_investors_active_accepting',
        columnNames: ['active', 'accepting_pitches']
      })
    );

    // Create indexes for investments table
    await queryRunner.createIndex(
      'investments',
      new TableIndex({
        name: 'IDX_investments_status_created',
        columnNames: ['status', 'created_at']
      })
    );

    await queryRunner.createIndex(
      'investments',
      new TableIndex({
        name: 'IDX_investments_investor_project',
        columnNames: ['investor_id', 'project_id']
      })
    );

    await queryRunner.createIndex(
      'investments',
      new TableIndex({
        name: 'IDX_investments_amount_currency',
        columnNames: ['amount', 'currency']
      })
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'investors',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'investors',
      new TableForeignKey({
        columnNames: ['verified_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'investments',
      new TableForeignKey({
        columnNames: ['investor_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'investors',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'investments',
      new TableForeignKey({
        columnNames: ['project_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'investments',
      new TableForeignKey({
        columnNames: ['introduction_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.dropForeignKey('investments', 'FK_investments_introduction_by_id');
    await queryRunner.dropForeignKey('investments', 'FK_investments_project_id');
    await queryRunner.dropForeignKey('investments', 'FK_investments_investor_id');
    await queryRunner.dropForeignKey('investors', 'FK_investors_verified_by_id');
    await queryRunner.dropForeignKey('investors', 'FK_investors_user_id');

    // Drop tables
    await queryRunner.dropTable('investments');
    await queryRunner.dropTable('investors');
  }
}