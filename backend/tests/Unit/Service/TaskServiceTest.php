<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Dto\TaskInput;
use App\Entity\Recurrence;
use App\Entity\Task;
use App\Repository\TaskRepository;
use App\Service\Exception\ResourceNotFound;
use App\Service\RecurrenceCalculator;
use App\Service\TaskService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;

/**
 * Task business logic covered by issue #5 (F-01 to F-04, RN-02, RN-03, RN-18).
 */
final class TaskServiceTest extends TestCase
{
    private const NOW = '2026-11-25 10:00:00';

    private TaskRepository&Stub $taskRepository;

    protected function setUp(): void
    {
        $this->taskRepository = $this->createStub(TaskRepository::class);
    }

    // RN-02: pending, creation date set by the system, persisted in one flush
    public function testCreateStoresAPendingTaskWithTheCurrentDate(): void
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::once())->method('persist')->with(self::isInstanceOf(Task::class));
        $entityManager->expects(self::once())->method('flush');

        $task = $this->service($entityManager)->create(new TaskInput('Buy bread'));

        self::assertSame('Buy bread', $task->getTitle());
        self::assertFalse($task->isCompleted());
        self::assertSame(self::NOW, $task->getCreatedAt()->format('Y-m-d H:i:s'));
        self::assertNull($task->getRecurrence());
        self::assertNull($task->getNextOccurrenceDate());
    }

    // RN-18
    public function testCreatingARecurringTaskSetsTheNextOccurrenceToTodayPlusTheRecurrence(): void
    {
        $task = $this->service()->create(new TaskInput('Water the plants', Recurrence::Weekly));

        self::assertSame(Recurrence::Weekly, $task->getRecurrence());
        self::assertSame('2026-12-02', $task->getNextOccurrenceDate()?->format('Y-m-d'));
    }

    // RN-18: a new recurrence recalculates the date from today
    public function testUpdatingTheRecurrenceRecalculatesTheNextOccurrence(): void
    {
        $task = $this->recurringTask(Recurrence::Weekly, '2026-12-01');
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::once())->method('flush');

        $this->service($entityManager)->update($task, new TaskInput('Water the plants', Recurrence::Monthly));

        self::assertSame(Recurrence::Monthly, $task->getRecurrence());
        self::assertSame('2026-12-25', $task->getNextOccurrenceDate()?->format('Y-m-d'));
    }

    // RN-18: the same recurrence keeps the date
    public function testUpdatingOnlyTheTitleKeepsTheNextOccurrence(): void
    {
        $task = $this->recurringTask(Recurrence::Weekly, '2026-12-01');

        $this->service()->update($task, new TaskInput('Water all the plants', Recurrence::Weekly));

        self::assertSame('Water all the plants', $task->getTitle());
        self::assertSame('2026-12-01', $task->getNextOccurrenceDate()?->format('Y-m-d'));
    }

    // RN-03, RN-18: a task that stops being recurring has no date
    public function testRemovingTheRecurrenceClearsTheNextOccurrence(): void
    {
        $task = $this->recurringTask(Recurrence::Weekly, '2026-12-01');

        $this->service()->update($task, new TaskInput('Water the plants'));

        self::assertFalse($task->isRecurring());
        self::assertNull($task->getNextOccurrenceDate());
    }

    // F-02
    public function testGetTaskReturnsTheTaskFromTheRepository(): void
    {
        $task = new Task('Buy bread', new \DateTimeImmutable(self::NOW));
        $this->taskRepository->method('find')->willReturn($task);

        self::assertSame($task, $this->service()->getTask(7));
    }

    // F-02: unknown id -> 404 in the API
    public function testGetTaskThrowsWhenTheTaskDoesNotExist(): void
    {
        $this->taskRepository->method('find')->willReturn(null);

        $this->expectException(ResourceNotFound::class);

        $this->service()->getTask(999);
    }

    private function service(?EntityManagerInterface $entityManager = null): TaskService
    {
        return new TaskService(
            $entityManager ?? $this->createStub(EntityManagerInterface::class),
            $this->taskRepository,
            new RecurrenceCalculator(),
            new MockClock(self::NOW),
        );
    }

    private function recurringTask(Recurrence $recurrence, string $nextOccurrenceDate): Task
    {
        return new Task(
            'Water the plants',
            new \DateTimeImmutable('2026-11-24 10:00:00'),
            $recurrence,
            new \DateTimeImmutable($nextOccurrenceDate),
        );
    }
}
