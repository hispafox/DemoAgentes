<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adds task_template and the link task.template_id with ON DELETE RESTRICT
 * (docs/analisis.md §3, RN-08, RN-12, issue #8).
 */
final class Version20261125211527 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add task_template and task.template_id (#8)';
    }

    public function up(Schema $schema): void
    {
        // SQLite cannot add a foreign key to an existing table: task is rebuilt with it.
        $this->addSql(<<<'SQL'
            CREATE TABLE task_template (
              id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
              title VARCHAR(255) NOT NULL,
              recurrence VARCHAR(10) DEFAULT NULL
            )
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TEMPORARY TABLE __temp__task AS
            SELECT
              id,
              title,
              completed,
              created_at,
              recurrence,
              next_occurrence_date,
              deleted_at
            FROM
              task
        SQL);
        $this->addSql('DROP TABLE task');
        $this->addSql(<<<'SQL'
            CREATE TABLE task (
              id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
              title VARCHAR(255) NOT NULL,
              completed BOOLEAN DEFAULT 0 NOT NULL,
              created_at DATETIME NOT NULL,
              recurrence VARCHAR(10) DEFAULT NULL,
              next_occurrence_date DATE DEFAULT NULL,
              deleted_at DATETIME DEFAULT NULL,
              template_id INTEGER DEFAULT NULL,
              CONSTRAINT FK_527EDB255DA0FB8 FOREIGN KEY (template_id) REFERENCES task_template (id) ON DELETE RESTRICT NOT DEFERRABLE INITIALLY IMMEDIATE
            )
        SQL);
        $this->addSql(<<<'SQL'
            INSERT INTO task (
              id, title, completed, created_at, recurrence,
              next_occurrence_date, deleted_at
            )
            SELECT
              id,
              title,
              completed,
              created_at,
              recurrence,
              next_occurrence_date,
              deleted_at
            FROM
              __temp__task
        SQL);
        $this->addSql('DROP TABLE __temp__task');
        $this->addSql('CREATE INDEX IDX_527EDB255DA0FB8 ON task (template_id)');
    }

    public function down(Schema $schema): void
    {
        // task is rebuilt without template_id before dropping task_template.
        $this->addSql(<<<'SQL'
            CREATE TEMPORARY TABLE __temp__task AS
            SELECT
              id,
              title,
              completed,
              created_at,
              recurrence,
              next_occurrence_date,
              deleted_at
            FROM
              task
        SQL);
        $this->addSql('DROP TABLE task');
        $this->addSql(<<<'SQL'
            CREATE TABLE task (
              id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
              title VARCHAR(255) NOT NULL,
              completed BOOLEAN DEFAULT 0 NOT NULL,
              created_at DATETIME NOT NULL,
              recurrence VARCHAR(10) DEFAULT NULL,
              next_occurrence_date DATE DEFAULT NULL,
              deleted_at DATETIME DEFAULT NULL
            )
        SQL);
        $this->addSql(<<<'SQL'
            INSERT INTO task (
              id, title, completed, created_at, recurrence,
              next_occurrence_date, deleted_at
            )
            SELECT
              id,
              title,
              completed,
              created_at,
              recurrence,
              next_occurrence_date,
              deleted_at
            FROM
              __temp__task
        SQL);
        $this->addSql('DROP TABLE __temp__task');
        $this->addSql('DROP TABLE task_template');
    }
}
