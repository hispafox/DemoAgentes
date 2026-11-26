<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Dto\CategoryInput;
use App\Entity\Category;
use App\Entity\Exception\DomainRuleViolation;
use App\Repository\CategoryRepository;
use App\Repository\TaskRepository;
use App\Service\CategoryService;
use App\Service\Exception\ResourceNotFound;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Exception\ValidationFailedException;

/**
 * Category business logic covered by issue #15 (F-15 to F-18, RN-14, RN-16, RN-17).
 */
final class CategoryServiceTest extends TestCase
{
    private CategoryRepository&Stub $categoryRepository;
    private TaskRepository&Stub $taskRepository;

    protected function setUp(): void
    {
        $this->categoryRepository = $this->createStub(CategoryRepository::class);
        $this->taskRepository = $this->createStub(TaskRepository::class);
    }

    // F-16, RN-14
    public function testCreateStoresTheCategory(): void
    {
        $this->categoryRepository->method('existsWithName')->willReturn(false);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::once())->method('persist')->with(self::isInstanceOf(Category::class));
        $entityManager->expects(self::once())->method('flush');

        $category = $this->service($entityManager)->create(new CategoryInput(' Home '));

        self::assertSame('Home', $category->getName());
    }

    // RN-17: a duplicate name is a validation error on "name" and nothing is saved
    public function testCreateRejectsDuplicateName(): void
    {
        $this->categoryRepository->method('existsWithName')->willReturn(true);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::never())->method('persist');
        $entityManager->expects(self::never())->method('flush');

        try {
            $this->service($entityManager)->create(new CategoryInput(' casa '));
            self::fail('A ValidationFailedException was expected.');
        } catch (ValidationFailedException $exception) {
            self::assertCount(1, $exception->getViolations());
            self::assertSame('name', $exception->getViolations()[0]->getPropertyPath());
        }
    }

    // F-17, RN-17: the rename checks the name leaving out the category itself
    public function testRenameChecksTheNameExcludingTheCategoryItself(): void
    {
        $category = new Category('Home');
        $categoryRepository = $this->createMock(CategoryRepository::class);
        $categoryRepository->expects(self::once())->method('existsWithName')->with('Home', null)->willReturn(false);
        $this->categoryRepository = $categoryRepository;

        $this->service()->rename($category, new CategoryInput('Home'));

        self::assertSame('Home', $category->getName());
    }

    // RN-17
    public function testRenameRejectsDuplicateName(): void
    {
        $category = new Category('Home');
        $this->categoryRepository->method('existsWithName')->willReturn(true);

        $this->expectException(ValidationFailedException::class);

        $this->service()->rename($category, new CategoryInput('Work'));
    }

    // Unknown id -> 404 in the API
    public function testGetCategoryThrowsWhenItDoesNotExist(): void
    {
        $this->categoryRepository->method('find')->willReturn(null);

        $this->expectException(ResourceNotFound::class);

        $this->service()->getCategory(999);
    }

    // RN-16: a category with tasks (trash included, counted by the repository) is not deleted
    public function testDeleteWithTasksThrowsRuleViolation(): void
    {
        $this->taskRepository->method('countByCategory')->willReturn(1);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::never())->method('remove');

        $this->expectException(DomainRuleViolation::class);

        $this->service($entityManager)->delete(new Category('Home'));
    }

    // F-18: without tasks, the category is deleted for good
    public function testDeleteWithoutTasksRemovesCategory(): void
    {
        $category = new Category('Home');
        $this->taskRepository->method('countByCategory')->willReturn(0);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::once())->method('remove')->with($category);
        $entityManager->expects(self::once())->method('flush');

        $this->service($entityManager)->delete($category);
    }

    private function service(?EntityManagerInterface $entityManager = null): CategoryService
    {
        return new CategoryService(
            $entityManager ?? $this->createStub(EntityManagerInterface::class),
            $this->categoryRepository,
            $this->taskRepository,
        );
    }
}
