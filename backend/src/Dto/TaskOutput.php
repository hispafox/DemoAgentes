<?php

declare(strict_types=1);

namespace App\Dto;

use App\Entity\Task;

/**
 * Task as returned by the API (docs/analisis.md §4).
 *
 * Issue #5 covers the base fields. templateId (#8), deletedAt (#7) and
 * categoryId (#15) are added with the issues that bring them to the entity.
 */
final readonly class TaskOutput
{
    public function __construct(
        public int $id,
        public string $title,
        public bool $completed,
        public string $createdAt,
        public ?string $recurrence,
        public ?string $nextOccurrenceDate,
    ) {
    }

    public static function fromEntity(Task $task): self
    {
        return new self(
            id: (int) $task->getId(),
            title: $task->getTitle(),
            completed: $task->isCompleted(),
            createdAt: $task->getCreatedAt()->format(\DATE_ATOM),
            recurrence: $task->getRecurrence()?->value,
            nextOccurrenceDate: $task->getNextOccurrenceDate()?->format('Y-m-d'),
        );
    }
}
