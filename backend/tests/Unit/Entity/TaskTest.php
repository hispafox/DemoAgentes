<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Exception\DomainRuleViolation;
use App\Entity\Recurrence;
use App\Entity\Task;
use PHPUnit\Framework\TestCase;

/**
 * Domain rules of Task covered by issue #5 (RN-01 to RN-04).
 */
final class TaskTest extends TestCase
{
    private \DateTimeImmutable $now;

    protected function setUp(): void
    {
        $this->now = new \DateTimeImmutable('2026-11-24 10:00:00');
    }

    // RN-02
    public function testNewTaskIsPendingWithTheGivenCreationDate(): void
    {
        $task = new Task('Water the plants', $this->now);

        self::assertNull($task->getId());
        self::assertSame('Water the plants', $task->getTitle());
        self::assertFalse($task->isCompleted());
        self::assertSame($this->now, $task->getCreatedAt());
    }

    // RN-01
    public function testTitleIsTrimmed(): void
    {
        $task = new Task('  Water the plants  ', $this->now);

        self::assertSame('Water the plants', $task->getTitle());
    }

    // RN-01
    public function testBlankTitleIsRejected(): void
    {
        $this->expectException(DomainRuleViolation::class);
        $this->expectExceptionMessage('RN-01');

        new Task('   ', $this->now);
    }

    // RN-01
    public function testTitleLongerThan255CharactersIsRejected(): void
    {
        $this->expectException(DomainRuleViolation::class);

        new Task(str_repeat('a', Task::TITLE_MAX_LENGTH + 1), $this->now);
    }

    // RN-01
    public function testTitleOf255CharactersIsAccepted(): void
    {
        $task = new Task(str_repeat('a', Task::TITLE_MAX_LENGTH), $this->now);

        self::assertSame(Task::TITLE_MAX_LENGTH, mb_strlen($task->getTitle()));
    }

    // RN-01
    public function testChangingTheTitleToBlankIsRejected(): void
    {
        $task = new Task('Water the plants', $this->now);

        $this->expectException(DomainRuleViolation::class);

        $task->setTitle('');
    }

    // RN-03
    public function testTaskWithoutRecurrenceIsNotRecurring(): void
    {
        $task = new Task('Buy bread', $this->now);

        self::assertFalse($task->isRecurring());
        self::assertNull($task->getRecurrence());
        self::assertNull($task->getNextOccurrenceDate());
    }

    // RN-03, RN-04
    public function testTaskWithRecurrenceIsRecurring(): void
    {
        $next = new \DateTimeImmutable('2026-12-01');
        $task = new Task('Water the plants', $this->now, Recurrence::Weekly, $next);

        self::assertTrue($task->isRecurring());
        self::assertSame(Recurrence::Weekly, $task->getRecurrence());
        self::assertSame($next, $task->getNextOccurrenceDate());
    }

    // RN-03
    public function testNonRecurringTaskCannotHaveANextOccurrenceDate(): void
    {
        $this->expectException(DomainRuleViolation::class);
        $this->expectExceptionMessage('RN-03');

        new Task('Buy bread', $this->now, null, new \DateTimeImmutable('2026-12-01'));
    }

    // RN-03
    public function testRemovingTheRecurrenceAlsoRemovesTheNextOccurrenceDate(): void
    {
        $task = new Task('Water the plants', $this->now, Recurrence::Daily, new \DateTimeImmutable('2026-11-25'));

        $task->setRecurrence(null);

        self::assertFalse($task->isRecurring());
        self::assertNull($task->getNextOccurrenceDate());
    }

    // RN-04
    public function testRecurrenceOnlyAcceptsDailyWeeklyAndMonthly(): void
    {
        self::assertSame(['daily', 'weekly', 'monthly'], array_map(
            static fn (Recurrence $r): string => $r->value,
            Recurrence::cases(),
        ));
        self::assertNull(Recurrence::tryFrom('yearly'));
    }

    // RN-11
    public function testCompleteMarksThePendingTaskAsCompleted(): void
    {
        $task = new Task('Water the plants', $this->now);

        $task->complete();

        self::assertTrue($task->isCompleted());
    }

    // RN-11: a completed task cannot be completed again
    public function testCompletingACompletedTaskIsRejected(): void
    {
        $task = new Task('Water the plants', $this->now);
        $task->complete();

        $this->expectException(DomainRuleViolation::class);
        $this->expectExceptionMessage('RN-11');

        $task->complete();
    }
}
