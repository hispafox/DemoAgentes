<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Dto\TaskInput;
use App\Entity\Exception\DomainRuleViolation;
use App\Entity\Recurrence;
use App\Entity\Task;
use App\Entity\TaskTemplate;
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

    // RN-06: completing a non-recurring task creates nothing else
    public function testCompletingANonRecurringTaskCreatesNoNextOccurrence(): void
    {
        $task = new Task('Buy bread', new \DateTimeImmutable(self::NOW));
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::never())->method('persist');
        $entityManager->expects(self::once())->method('flush');

        $result = $this->service($entityManager)->complete($task);

        self::assertTrue($task->isCompleted());
        self::assertSame($task, $result->task);
        self::assertNull($result->nextOccurrence);
    }

    // RN-05: completing a recurring task creates exactly one pending occurrence, in the same flush
    public function testCompletingARecurringTaskCreatesTheNextOccurrence(): void
    {
        $task = $this->recurringTask(Recurrence::Weekly, '2026-11-25');
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::once())->method('persist')->with(self::isInstanceOf(Task::class));
        $entityManager->expects(self::once())->method('flush');

        $next = $this->service($entityManager)->complete($task)->nextOccurrence;

        self::assertNotNull($next);
        self::assertNotSame($task, $next);
        self::assertSame('Water the plants', $next->getTitle());
        self::assertSame(Recurrence::Weekly, $next->getRecurrence());
        self::assertFalse($next->isCompleted());
        self::assertSame(self::NOW, $next->getCreatedAt()->format('Y-m-d H:i:s'));
        self::assertSame('2026-12-02', $next->getNextOccurrenceDate()?->format('Y-m-d'));
    }

    // RN-05: monthly task completed on 31 January -> last day of February
    public function testCompletingAMonthlyTaskOnJanuary31CreatesTheNextOccurrenceOnTheLastDayOfFebruary(): void
    {
        $task = $this->recurringTask(Recurrence::Monthly, '2027-01-31');
        $service = new TaskService(
            $this->createStub(EntityManagerInterface::class),
            $this->taskRepository,
            new RecurrenceCalculator(),
            new MockClock('2027-01-31 18:00:00'),
        );

        $next = $service->complete($task)->nextOccurrence;

        self::assertSame('2027-02-28', $next?->getNextOccurrenceDate()?->format('Y-m-d'));
    }

    // RN-11: completing twice is rejected and nothing is saved
    public function testCompletingACompletedTaskIsRejectedWithoutSaving(): void
    {
        $task = new Task('Buy bread', new \DateTimeImmutable(self::NOW));
        $task->complete();
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::never())->method('flush');

        $this->expectException(DomainRuleViolation::class);

        $this->service($entityManager)->complete($task);
    }

    // RN-13: a task in the trash counts as not found
    public function testGetTaskThrowsWhenTheTaskIsInTheTrash(): void
    {
        $task = new Task('Buy bread', new \DateTimeImmutable(self::NOW));
        $task->moveToTrash(new \DateTimeImmutable(self::NOW));
        $this->taskRepository->method('find')->willReturn($task);

        $this->expectException(ResourceNotFound::class);

        $this->service()->getTask(7);
    }

    // RN-10: the deletion date comes from the clock
    public function testMoveToTrashUsesTheCurrentDateAndSaves(): void
    {
        $task = new Task('Buy bread', new \DateTimeImmutable('2026-11-24 10:00:00'));
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::once())->method('flush');

        $this->service($entityManager)->moveToTrash($task);

        self::assertSame(self::NOW, $task->getDeletedAt()?->format('Y-m-d H:i:s'));
    }

    // RN-10
    public function testRestoreBringsBackATaskFromTheTrash(): void
    {
        $task = new Task('Buy bread', new \DateTimeImmutable(self::NOW));
        $task->moveToTrash(new \DateTimeImmutable(self::NOW));
        $this->taskRepository->method('find')->willReturn($task);

        self::assertFalse($this->service()->restore(7)->isDeleted());
    }

    // Restoring an active task -> 409 in the API
    public function testRestoreThrowsWhenTheTaskIsNotInTheTrash(): void
    {
        $this->taskRepository->method('find')->willReturn(new Task('Buy bread', new \DateTimeImmutable(self::NOW)));

        $this->expectException(DomainRuleViolation::class);

        $this->service()->restore(7);
    }

    // Restoring an unknown task -> 404 in the API
    public function testRestoreThrowsWhenTheTaskDoesNotExist(): void
    {
        $this->taskRepository->method('find')->willReturn(null);

        $this->expectException(ResourceNotFound::class);

        $this->service()->restore(999);
    }

    // docs/analisis.md §5: the next occurrence keeps the template of the completed task (RN-08)
    public function testTheNextOccurrenceKeepsTheTemplate(): void
    {
        $template = new TaskTemplate('Water the plants', Recurrence::Weekly);
        $task = new Task('Water the plants', new \DateTimeImmutable(self::NOW), Recurrence::Weekly, new \DateTimeImmutable('2026-12-02'), $template);

        $next = $this->service()->complete($task)->nextOccurrence;

        self::assertSame($template, $next?->getTemplate());
    }
}
