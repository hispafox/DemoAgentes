<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adds category (unique name) and the link task.category_id with ON DELETE
 * RESTRICT (docs/analisis.md §3, RN-14 to RN-17, issue #15).
 */
final class Version20261126121937 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add category and task.category_id (#15)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            CREATE TABLE category (
              id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
              name VARCHAR(100) NOT NULL
            )
        SQL);
        $this->addSql('CREATE UNIQUE INDEX uniq_category_name ON category (name)');

        // SQLite cannot add a foreign key to an existing table: task is rebuilt with it.
        // The template foreign key keeps its ON DELETE RESTRICT (RN-12).
        $this->addSql(<<<'SQL'
            CREATE TEMPORARY TABLE __temp__task AS
            SELECT
              id,
              title,
              completed,
              created_at,
              recurrence,
              next_occurrence_date,
              deleted_at,
              template_id
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
              category_id INTEGER DEFAULT NULL,
              CONSTRAINT FK_527EDB255DA0FB8 FOREIGN KEY (template_id) REFERENCES task_template (id) ON DELETE RESTRICT NOT DEFERRABLE INITIALLY IMMEDIATE,
              CONSTRAINT FK_527EDB2512469DE2 FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE RESTRICT NOT DEFERRABLE INITIALLY IMMEDIATE
            )
        SQL);
        $this->addSql(<<<'SQL'
            INSERT INTO task (
              id, title, completed, created_at, recurrence,
              next_occurrence_date, deleted_at, template_id
            )
            SELECT
              id,
              title,
              completed,
              created_at,
              recurrence,
              next_occurrence_date,
              deleted_at,
              template_id
            FROM
              __temp__task
        SQL);
        $this->addSql('DROP TABLE __temp__task');
        $this->addSql('CREATE INDEX IDX_527EDB255DA0FB8 ON task (template_id)');
        $this->addSql('CREATE INDEX IDX_527EDB2512469DE2 ON task (category_id)');
    }

    public function down(Schema $schema): void
    {
        // task is rebuilt without category_id before dropping category.
        $this->addSql(<<<'SQL'
            CREATE TEMPORARY TABLE __temp__task AS
            SELECT
              id,
              title,
              completed,
              created_at,
              recurrence,
              next_occurrence_date,
              deleted_at,
              template_id
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
              next_occurrence_date, deleted_at, template_id
            )
            SELECT
              id,
              title,
              completed,
              created_at,
              recurrence,
              next_occurrence_date,
              deleted_at,
              template_id
            FROM
              __temp__task
        SQL);
        $this->addSql('DROP TABLE __temp__task');
        $this->addSql('CREATE INDEX IDX_527EDB255DA0FB8 ON task (template_id)');
        $this->addSql('DROP TABLE category');
    }
}
