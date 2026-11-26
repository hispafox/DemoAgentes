<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Category;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Data access for categories.
 *
 * @extends ServiceEntityRepository<Category>
 */
class CategoryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Category::class);
    }

    /**
     * F-15: all the categories, in creation order.
     *
     * @return list<Category>
     */
    public function findAllOrdered(): array
    {
        return $this->findBy([], ['id' => 'ASC']);
    }

    /**
     * RN-17: whether another category already has this name, ignoring case
     * and surrounding spaces. $exceptId leaves out the category being renamed.
     */
    public function existsWithName(string $name, ?int $exceptId = null): bool
    {
        $qb = $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->where('LOWER(TRIM(c.name)) = :name')
            ->setParameter('name', mb_strtolower(trim($name)));

        if (null !== $exceptId) {
            $qb->andWhere('c.id <> :exceptId')
                ->setParameter('exceptId', $exceptId);
        }

        return (int) $qb->getQuery()->getSingleScalarResult() > 0;
    }
}
