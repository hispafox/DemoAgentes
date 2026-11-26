<?php

declare(strict_types=1);

namespace App\Tests\Functional\Repository;

use App\Entity\Category;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * Queries of CategoryRepository on the SQLite test database (RN-17, issue #15).
 */
final class CategoryRepositoryTest extends KernelTestCase
{
    private EntityManagerInterface $entityManager;
    private CategoryRepository $repository;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->entityManager = self::getContainer()->get(EntityManagerInterface::class);
        $this->repository = self::getContainer()->get(CategoryRepository::class);
    }

    // RN-17: "Casa" is found when looking for " casa "
    public function testExistsWithNameIgnoresCaseAndSurroundingSpaces(): void
    {
        $this->save(new Category('Casa'));

        self::assertTrue($this->repository->existsWithName(' casa '));
        self::assertTrue($this->repository->existsWithName('CASA'));
        self::assertFalse($this->repository->existsWithName('Casas'));
    }

    // RN-17: when renaming, the category itself does not count
    public function testExistsWithNameExcludesOwnId(): void
    {
        $home = $this->save(new Category('Casa'));
        $work = $this->save(new Category('Trabajo'));

        self::assertFalse($this->repository->existsWithName('casa', $home->getId()));
        self::assertTrue($this->repository->existsWithName('casa', $work->getId()));
    }

    // F-15: creation order
    public function testFindAllOrderedReturnsTheCategoriesById(): void
    {
        $first = $this->save(new Category('Zeta'));
        $second = $this->save(new Category('Alfa'));

        self::assertSame([$first, $second], $this->repository->findAllOrdered());
    }

    private function save(Category $category): Category
    {
        $this->entityManager->persist($category);
        $this->entityManager->flush();

        return $category;
    }
}
