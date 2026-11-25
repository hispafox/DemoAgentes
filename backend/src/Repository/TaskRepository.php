<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Task;
use App\Entity\TaskTemplate;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Data access for tasks.
 *
 * The trash is a soft delete with deletedAt (RN-10): active tasks have it null.
 *
 * @extends ServiceEntityRepository<Task>
 */
class TaskRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Task::class);
    }

    /**
     * F-01, RN-10: tasks that are not in the trash, oldest first.
     *
     * @return list<Task>
     */
    public function findActive(): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.deletedAt IS NULL')
            ->orderBy('t.createdAt', 'ASC')
            ->addOrderBy('t.id', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * F-13: tasks in the trash, most recently deleted first.
     *
     * @return list<Task>
     */
    public function findDeleted(): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.deletedAt IS NOT NULL')
            ->orderBy('t.deletedAt', 'DESC')
            ->addOrderBy('t.id', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * RN-12: tasks created from a template, including those in the trash.
     */
    public function countByTemplate(TaskTemplate $template): int
    {
        return (int) $this->createQueryBuilder('t')
            ->select('COUNT(t.id)')
            ->where('t.template = :template')
            ->setParameter('template', $template)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
