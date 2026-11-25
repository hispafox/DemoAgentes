<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Task;

/**
 * Result of completing a task (docs/analisis.md §5): the completed task and,
 * if it was recurring, the next occurrence that was created (RN-05, RN-06).
 */
final readonly class CompleteResult
{
    public function __construct(
        public Task $task,
        public ?Task $nextOccurrence,
    ) {
    }
}
