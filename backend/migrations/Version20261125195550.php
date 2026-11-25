<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adds deleted_at to task for the trash (docs/analisis.md §3, RN-10, issue #7).
 */
final class Version20261125195550 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add deleted_at to task for the trash (#7)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE task ADD COLUMN deleted_at DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // SQLite cannot drop a column directly: the table is rebuilt without it.
        $this->addSql(<<<'SQL'
            CREATE TEMPORARY TABLE __temp__task AS
            SELECT
              id,
              title,
              completed,
              created_at,
              recurrence,
              next_occurrence_date
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
              next_occurrence_date DATE DEFAULT NULL
            )
        SQL);
        $this->addSql(<<<'SQL'
            INSERT INTO task (
              id, title, completed, created_at, recurrence,
              next_occurrence_date
            )
            SELECT
              id,
              title,
              completed,
              created_at,
              recurrence,
              next_occurrence_date
            FROM
              __temp__task
        SQL);
        $this->addSql('DROP TABLE __temp__task');
    }
}
