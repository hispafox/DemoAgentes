<?php

declare(strict_types=1);

namespace App\Dto;

use App\Entity\TaskTemplate;

/**
 * Task template as returned by the API (docs/analisis.md §4).
 */
final readonly class TaskTemplateOutput
{
    public function __construct(
        public int $id,
        public string $title,
        public ?string $recurrence,
    ) {
    }

    public static function fromEntity(TaskTemplate $template): self
    {
        return new self(
            id: (int) $template->getId(),
            title: $template->getTitle(),
            recurrence: $template->getRecurrence()?->value,
        );
    }
}
