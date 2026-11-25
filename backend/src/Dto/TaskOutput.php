<?php

declare(strict_types=1);

namespace App\Dto;

use App\Entity\Task;

/**
 * Task as returned by the API (docs/analisis.md §4).
 *
 * categoryId (#15) is added with the issue that brings it to the entity.
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
        public ?int $templateId,
        public ?string $deletedAt,
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
            templateId: $task->getTemplate()?->getId(),
            deletedAt: $task->getDeletedAt()?->format(\DATE_ATOM),
        );
    }
}
