<?php

declare(strict_types=1);

namespace App\Dto;

use App\Service\CompleteResult;

/**
 * Response of POST /api/tasks/{id}/complete (docs/analisis.md §4): the
 * completed task and the new occurrence, or null if it was not recurring.
 */
final readonly class CompleteTaskOutput
{
    public function __construct(
        public TaskOutput $task,
        public ?TaskOutput $nextOccurrence,
    ) {
    }

    public static function fromResult(CompleteResult $result): self
    {
        return new self(
            task: TaskOutput::fromEntity($result->task),
            nextOccurrence: null !== $result->nextOccurrence ? TaskOutput::fromEntity($result->nextOccurrence) : null,
        );
    }
}
