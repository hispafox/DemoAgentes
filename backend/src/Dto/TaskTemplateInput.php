<?php

declare(strict_types=1);

namespace App\Dto;

use App\Entity\Recurrence;
use App\Entity\TaskTemplate;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Body of POST and PUT /api/task-templates (docs/analisis.md §4).
 */
final readonly class TaskTemplateInput
{
    public function __construct(
        #[Assert\NotBlank(normalizer: 'trim')] // RN-07
        #[Assert\Length(max: TaskTemplate::TITLE_MAX_LENGTH)] // RN-07
        public string $title = '',
        public ?Recurrence $recurrence = null, // RN-07, RN-03: null or one of the enum values
    ) {
    }
}
