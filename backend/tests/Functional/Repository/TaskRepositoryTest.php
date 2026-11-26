<?php

declare(strict_types=1);

namespace App\Tests\Functional\Repository;

use App\Entity\Category;
use App\Entity\Task;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * Queries of TaskRepository on the SQLite test database.
 *
 * Issue #15 adds countByCategory (RN-16).
 */
final class TaskRepositoryTest extends KernelTestCase
{
    // RN-16: tasks in the trash count too
    public function testCountByCategoryIncludesTrash(): void
    {
        self::bootKernel();
        $entityManager = self::getContainer()->get(EntityManagerInterface::class);
        $repository = self::getContainer()->get(TaskRepository::class);
        $now = new \DateTimeImmutable('2026-11-25 10:00:00');

        $home = new Category('Home');
        $work = new Category('Work');
        $active = new Task('Buy bread', $now);
        $active->setCategory($home);
        $trashed = new Task('Water the plants', $now);
        $trashed->setCategory($home);
        $trashed->moveToTrash($now);
        $withoutCategory = new Task('Call mum', $now);

        foreach ([$home, $work, $active, $trashed, $withoutCategory] as $entity) {
            $entityManager->persist($entity);
        }
        $entityManager->flush();

        self::assertSame(2, $repository->countByCategory($home));
        self::assertSame(0, $repository->countByCategory($work));
    }
}
