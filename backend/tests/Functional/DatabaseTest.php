<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Platforms\SQLitePlatform;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * Smoke test for the functional suite: the kernel boots in the test
 * environment against its own SQLite database, and every test runs inside
 * a transaction that is rolled back afterwards (dama/doctrine-test-bundle).
 */
final class DatabaseTest extends KernelTestCase
{
    private Connection $connection;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->connection = self::getContainer()->get(Connection::class);
    }

    public function testUsesTheSqliteTestDatabase(): void
    {
        self::assertInstanceOf(SQLitePlatform::class, $this->connection->getDatabasePlatform());
        self::assertStringEndsWith('test.db', (string) $this->connection->getParams()['path']);
    }

    public function testWritesInsideATestAreVisibleDuringTheTest(): void
    {
        $this->connection->executeStatement('CREATE TABLE IF NOT EXISTS smoke (id INTEGER PRIMARY KEY)');
        $this->connection->executeStatement('INSERT INTO smoke (id) VALUES (1)');

        self::assertSame(1, (int) $this->connection->fetchOne('SELECT COUNT(*) FROM smoke'));
    }

    public function testWritesFromThePreviousTestWereRolledBack(): void
    {
        $this->connection->executeStatement('CREATE TABLE IF NOT EXISTS smoke (id INTEGER PRIMARY KEY)');

        self::assertSame(0, (int) $this->connection->fetchOne('SELECT COUNT(*) FROM smoke'));
    }
}
