<?php

declare(strict_types=1);

namespace App\Service;

use App\Dto\CategoryInput;
use App\Entity\Category;
use App\Entity\Exception\DomainRuleViolation;
use App\Repository\CategoryRepository;
use App\Repository\TaskRepository;
use App\Service\Exception\ResourceNotFound;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Exception\ValidationFailedException;

/**
 * Business logic for categories (docs/analisis.md §5, version 0.2, issue #15).
 */
final class CategoryService
{
    public const DUPLICATE_NAME_MESSAGE = 'A category with this name already exists.';

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly CategoryRepository $categoryRepository,
        private readonly TaskRepository $taskRepository,
    ) {
    }

    /**
     * F-15: all categories, in creation order.
     *
     * @return list<Category>
     */
    public function list(): array
    {
        return $this->categoryRepository->findAllOrdered();
    }

    /**
     * A category by id.
     *
     * @throws ResourceNotFound if it does not exist
     */
    public function getCategory(int $id): Category
    {
        return $this->categoryRepository->find($id) ?? throw ResourceNotFound::category($id);
    }

    /**
     * F-16, RN-14, RN-17: creates a category with a name no other category has.
     *
     * @throws ValidationFailedException if the name already exists (422)
     */
    public function create(CategoryInput $input): Category
    {
        $this->assertNameIsFree($input, null);

        $category = new Category($input->name);

        $this->entityManager->persist($category);
        $this->entityManager->flush();

        return $category;
    }

    /**
     * F-17, RN-14, RN-17: renames a category. Its own current name does not
     * count as a duplicate.
     *
     * @throws ValidationFailedException if another category has the name (422)
     */
    public function rename(Category $category, CategoryInput $input): Category
    {
        $this->assertNameIsFree($input, $category->getId());

        $category->rename($input->name);
        $this->entityManager->flush();

        return $category;
    }

    /**
     * F-18, RN-16: deletes the category for good, only if no task has it
     * (tasks in the trash count too).
     *
     * @throws DomainRuleViolation if it has tasks (409)
     */
    public function delete(Category $category): void
    {
        if ($this->taskRepository->countByCategory($category) > 0) {
            throw new DomainRuleViolation('RN-16: a category with tasks cannot be deleted.');
        }

        $this->entityManager->remove($category);
        $this->entityManager->flush();
    }

    /**
     * RN-17: the name must be unique ignoring case and surrounding spaces. A
     * duplicate is a validation error on "name", with the same violations
     * format as the other 422 responses.
     */
    private function assertNameIsFree(CategoryInput $input, ?int $exceptId): void
    {
        if (!$this->categoryRepository->existsWithName($input->name, $exceptId)) {
            return;
        }

        throw new ValidationFailedException($input, new ConstraintViolationList([new ConstraintViolation(self::DUPLICATE_NAME_MESSAGE, self::DUPLICATE_NAME_MESSAGE, [], $input, 'name', $input->name)]));
    }
}
