import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class Phase3AdvancedProjectManagement1724524800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create project_resources table
    await queryRunner.createTable(
      new Table({
        name: 'project_resources',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'project_id',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['human', 'financial', 'equipment', 'software', 'service'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['planned', 'allocated', 'in_use', 'completed', 'cancelled'],
            default: "'planned'",
          },
          {
            name: 'budget_allocated',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'budget_used',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'cost_per_unit',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
          },
          {
            name: 'quantity_required',
            type: 'int',
            default: 1,
          },
          {
            name: 'quantity_allocated',
            type: 'int',
            default: 0,
          },
          {
            name: 'utilization_percentage',
            type: 'int',
            default: 0,
          },
          {
            name: 'allocation_start_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'allocation_end_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'actual_start_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'actual_end_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'assigned_to_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'supplier_vendor',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_critical',
            type: 'boolean',
            default: false,
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

    // Create project_risks table
    await queryRunner.createTable(
      new Table({
        name: 'project_risks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'project_id',
            type: 'uuid',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'category',
            type: 'enum',
            enum: ['technical', 'market', 'financial', 'operational', 'regulatory', 'team', 'strategic'],
          },
          {
            name: 'probability',
            type: 'enum',
            enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
          },
          {
            name: 'impact',
            type: 'enum',
            enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['identified', 'under_review', 'active', 'mitigated', 'occurred', 'closed'],
            default: "'identified'",
          },
          {
            name: 'risk_score',
            type: 'decimal',
            precision: 3,
            scale: 1,
            isNullable: true,
          },
          {
            name: 'priority_level',
            type: 'int',
            default: 3,
          },
          {
            name: 'mitigation_strategy',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'contingency_plan',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'mitigation_cost',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'mitigation_timeline',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'owner_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'identified_date',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'target_resolution_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'actual_resolution_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_reviewed_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'potential_delay_days',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'potential_cost_impact',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'affected_milestones',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'tags',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'external_dependencies',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
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

    // Create project_documents table
    await queryRunner.createTable(
      new Table({
        name: 'project_documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'project_id',
            type: 'uuid',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['business_plan', 'technical_spec', 'financial_model', 'market_research', 'legal_document', 'presentation', 'report', 'requirements', 'design', 'other'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'under_review', 'approved', 'archived'],
            default: "'draft'",
          },
          {
            name: 'access_level',
            type: 'enum',
            enum: ['private', 'team', 'project', 'company', 'public'],
            default: "'team'",
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'file_path',
            type: 'varchar',
            length: '1000',
          },
          {
            name: 'file_size',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'file_hash',
            type: 'varchar',
            length: '64',
            isNullable: true,
          },
          {
            name: 'version_number',
            type: 'int',
            default: 1,
          },
          {
            name: 'parent_document_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_by_id',
            type: 'uuid',
          },
          {
            name: 'last_modified_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reviewed_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reviewed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'approved_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'approved_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'milestone_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'due_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'expiry_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'shared_with',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'external_link',
            type: 'varchar',
            length: '1000',
            isNullable: true,
          },
          {
            name: 'is_confidential',
            type: 'boolean',
            default: false,
          },
          {
            name: 'download_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'view_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'last_accessed',
            type: 'timestamp',
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

    // Create project_updates table
    await queryRunner.createTable(
      new Table({
        name: 'project_updates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'project_id',
            type: 'uuid',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['status_update', 'milestone_progress', 'health_check', 'risk_alert', 'budget_update', 'team_update', 'general'],
          },
          {
            name: 'health_status',
            type: 'enum',
            enum: ['excellent', 'good', 'fair', 'at_risk', 'critical'],
            isNullable: true,
          },
          {
            name: 'overall_progress_percentage',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'schedule_variance_days',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'budget_variance_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'milestones_completed',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'milestones_total',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'team_velocity',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'quality_score',
            type: 'decimal',
            precision: 3,
            scale: 1,
            isNullable: true,
          },
          {
            name: 'active_blockers',
            type: 'int',
            default: 0,
          },
          {
            name: 'resolved_issues',
            type: 'int',
            default: 0,
          },
          {
            name: 'new_risks_identified',
            type: 'int',
            default: 0,
          },
          {
            name: 'budget_spent',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'budget_remaining',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'projected_budget_at_completion',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'team_size',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'team_utilization_percentage',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'team_satisfaction_score',
            type: 'decimal',
            precision: 3,
            scale: 1,
            isNullable: true,
          },
          {
            name: 'projected_completion_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'baseline_completion_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_by_id',
            type: 'uuid',
          },
          {
            name: 'is_milestone_update',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_stakeholder_visible',
            type: 'boolean',
            default: true,
          },
          {
            name: 'requires_attention',
            type: 'boolean',
            default: false,
          },
          {
            name: 'tags',
            type: 'text[]',
            default: 'ARRAY[]::text[]',
          },
          {
            name: 'attachments',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'metrics',
            type: 'json',
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

    // Create milestone_dependencies table
    await queryRunner.createTable(
      new Table({
        name: 'milestone_dependencies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'predecessor_milestone_id',
            type: 'uuid',
          },
          {
            name: 'successor_milestone_id',
            type: 'uuid',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'],
            default: "'finish_to_start'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'satisfied', 'blocked', 'cancelled'],
            default: "'active'",
          },
          {
            name: 'lag_days',
            type: 'int',
            default: 0,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_hard_constraint',
            type: 'boolean',
            default: true,
          },
          {
            name: 'criticality_level',
            type: 'int',
            default: 3,
          },
          {
            name: 'created_by_id',
            type: 'uuid',
          },
          {
            name: 'satisfied_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'blocked_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'block_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'delay_impact_days',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'cost_impact',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
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

    // Create indexes for performance
    await queryRunner.createIndex(
      'project_resources',
      new TableIndex({
        name: 'IDX_project_resources_project_type',
        columnNames: ['project_id', 'type']
      })
    );

    await queryRunner.createIndex(
      'project_resources',
      new TableIndex({
        name: 'IDX_project_resources_status',
        columnNames: ['status']
      })
    );

    await queryRunner.createIndex(
      'project_risks',
      new TableIndex({
        name: 'IDX_project_risks_project_status',
        columnNames: ['project_id', 'status']
      })
    );

    await queryRunner.createIndex(
      'project_risks',
      new TableIndex({
        name: 'IDX_project_risks_priority',
        columnNames: ['priority_level', 'risk_score']
      })
    );

    await queryRunner.createIndex(
      'project_documents',
      new TableIndex({
        name: 'IDX_project_documents_project_type',
        columnNames: ['project_id', 'type']
      })
    );

    await queryRunner.createIndex(
      'project_documents',
      new TableIndex({
        name: 'IDX_project_documents_status',
        columnNames: ['status', 'access_level']
      })
    );

    await queryRunner.createIndex(
      'project_updates',
      new TableIndex({
        name: 'IDX_project_updates_project_date',
        columnNames: ['project_id', 'created_at']
      })
    );

    await queryRunner.createIndex(
      'project_updates',
      new TableIndex({
        name: 'IDX_project_updates_type_health',
        columnNames: ['type', 'health_status']
      })
    );

    await queryRunner.createIndex(
      'milestone_dependencies',
      new TableIndex({
        name: 'IDX_milestone_dependencies_predecessor',
        columnNames: ['predecessor_milestone_id']
      })
    );

    await queryRunner.createIndex(
      'milestone_dependencies',
      new TableIndex({
        name: 'IDX_milestone_dependencies_successor',
        columnNames: ['successor_milestone_id']
      })
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'project_resources',
      new TableForeignKey({
        columnNames: ['project_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'project_resources',
      new TableForeignKey({
        columnNames: ['assigned_to_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'project_risks',
      new TableForeignKey({
        columnNames: ['project_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'project_risks',
      new TableForeignKey({
        columnNames: ['owner_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'project_documents',
      new TableForeignKey({
        columnNames: ['project_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'project_documents',
      new TableForeignKey({
        columnNames: ['parent_document_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'project_documents',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'project_documents',
      new TableForeignKey({
        columnNames: ['created_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'project_documents',
      new TableForeignKey({
        columnNames: ['last_modified_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'project_documents',
      new TableForeignKey({
        columnNames: ['reviewed_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'project_documents',
      new TableForeignKey({
        columnNames: ['approved_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'project_updates',
      new TableForeignKey({
        columnNames: ['project_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'project_updates',
      new TableForeignKey({
        columnNames: ['created_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'milestone_dependencies',
      new TableForeignKey({
        columnNames: ['predecessor_milestone_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'project_milestones',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'milestone_dependencies',
      new TableForeignKey({
        columnNames: ['successor_milestone_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'project_milestones',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'milestone_dependencies',
      new TableForeignKey({
        columnNames: ['created_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.dropForeignKey('milestone_dependencies', 'FK_milestone_dependencies_created_by_id');
    await queryRunner.dropForeignKey('milestone_dependencies', 'FK_milestone_dependencies_successor_milestone_id');
    await queryRunner.dropForeignKey('milestone_dependencies', 'FK_milestone_dependencies_predecessor_milestone_id');
    await queryRunner.dropForeignKey('project_updates', 'FK_project_updates_created_by_id');
    await queryRunner.dropForeignKey('project_updates', 'FK_project_updates_project_id');
    await queryRunner.dropForeignKey('project_documents', 'FK_project_documents_approved_by_id');
    await queryRunner.dropForeignKey('project_documents', 'FK_project_documents_reviewed_by_id');
    await queryRunner.dropForeignKey('project_documents', 'FK_project_documents_last_modified_by_id');
    await queryRunner.dropForeignKey('project_documents', 'FK_project_documents_created_by_id');
    await queryRunner.dropForeignKey('project_documents', 'FK_project_documents_parent_document_id');
    await queryRunner.dropForeignKey('project_documents', 'FK_project_documents_project_id');
    await queryRunner.dropForeignKey('project_risks', 'FK_project_risks_owner_id');
    await queryRunner.dropForeignKey('project_risks', 'FK_project_risks_project_id');
    await queryRunner.dropForeignKey('project_resources', 'FK_project_resources_assigned_to_id');
    await queryRunner.dropForeignKey('project_resources', 'FK_project_resources_project_id');

    // Drop tables
    await queryRunner.dropTable('milestone_dependencies');
    await queryRunner.dropTable('project_updates');
    await queryRunner.dropTable('project_documents');
    await queryRunner.dropTable('project_risks');
    await queryRunner.dropTable('project_resources');
  }
}