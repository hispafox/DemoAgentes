<?php

declare(strict_types=1);

namespace App\Dto;

use App\Entity\Recurrence;
use App\Entity\Task;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Body of POST and PUT /api/tasks (docs/analisis.md §4).
 *
 * The status, dates and links are not accepted: a task is completed with
 * /complete (RN-11), createdAt is set by the system (RN-02) and
 * nextOccurrenceDate is calculated by the service (RN-18).
 *
 * categoryId (#15) is null (no category) or the id of an existing category;
 * TaskService checks that it exists (F-19, RN-15).
 */
final readonly class TaskInput
{
    public function __construct(
        #[Assert\NotBlank(normalizer: 'trim')] // RN-01
        #[Assert\Length(max: Task::TITLE_MAX_LENGTH)] // RN-01
        public string $title = '',
        public ?Recurrence $recurrence = null, // RN-03, RN-04: null or one of the enum values
        public ?int $categoryId = null, // RN-15: absent or null removes the category
    ) {
    }
}
