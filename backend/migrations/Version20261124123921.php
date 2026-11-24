<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Creates the task table with its base fields (docs/analisis.md §3, issue #5).
 */
final class Version20261124123921 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create task table (#5)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE task (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, title VARCHAR(255) NOT NULL, completed BOOLEAN DEFAULT 0 NOT NULL, created_at DATETIME NOT NULL, recurrence VARCHAR(10) DEFAULT NULL, next_occurrence_date DATE DEFAULT NULL)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE task');
    }
}
