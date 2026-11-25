<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Dto\TaskTemplateInput;
use App\Entity\Exception\DomainRuleViolation;
use App\Entity\Recurrence;
use App\Entity\TaskTemplate;
use App\Repository\TaskRepository;
use App\Repository\TaskTemplateRepository;
use App\Service\Exception\ResourceNotFound;
use App\Service\TaskTemplateService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;

/**
 * Template business logic covered by issue #8 (F-07 to F-11, RN-07, RN-09, RN-12).
 */
final class TaskTemplateServiceTest extends TestCase
{
    private TaskTemplateRepository&Stub $templateRepository;
    private TaskRepository&Stub $taskRepository;

    protected function setUp(): void
    {
        $this->templateRepository = $this->createStub(TaskTemplateRepository::class);
        $this->taskRepository = $this->createStub(TaskRepository::class);
    }

    // F-09, RN-07
    public function testCreateStoresTheTemplate(): void
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::once())->method('persist')->with(self::isInstanceOf(TaskTemplate::class));
        $entityManager->expects(self::once())->method('flush');

        $template = $this->service($entityManager)->create(new TaskTemplateInput('Water the plants', Recurrence::Weekly));

        self::assertSame('Water the plants', $template->getTitle());
        self::assertSame(Recurrence::Weekly, $template->getRecurrence());
    }

    // F-10
    public function testUpdateChangesTitleAndRecurrence(): void
    {
        $template = new TaskTemplate('Water the plants', Recurrence::Weekly);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::once())->method('flush');

        $this->service($entityManager)->update($template, new TaskTemplateInput('Water the garden'));

        self::assertSame('Water the garden', $template->getTitle());
        self::assertNull($template->getRecurrence());
    }

    // F-08: unknown id -> 404 in the API
    public function testGetTemplateThrowsWhenItDoesNotExist(): void
    {
        $this->templateRepository->method('find')->willReturn(null);

        $this->expectException(ResourceNotFound::class);

        $this->service()->getTemplate(999);
    }

    // RN-12: a template with tasks (trash included, counted by the repository) is not deleted
    public function testDeleteIsRejectedWhenTheTemplateHasTasks(): void
    {
        $this->taskRepository->method('countByTemplate')->willReturn(1);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::never())->method('remove');

        $this->expectException(DomainRuleViolation::class);

        $this->service($entityManager)->delete(new TaskTemplate('Water the plants'));
    }

    // F-11: without tasks it is deleted for good
    public function testDeleteRemovesATemplateWithoutTasks(): void
    {
        $template = new TaskTemplate('Water the plants');
        $this->taskRepository->method('countByTemplate')->willReturn(0);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::once())->method('remove')->with($template);
        $entityManager->expects(self::once())->method('flush');

        $this->service($entityManager)->delete($template);
    }

    private function service(?EntityManagerInterface $entityManager = null): TaskTemplateService
    {
        return new TaskTemplateService(
            $entityManager ?? $this->createStub(EntityManagerInterface::class),
            $this->templateRepository,
            $this->taskRepository,
        );
    }
}
