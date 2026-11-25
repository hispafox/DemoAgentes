<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\Exception\DomainRuleViolation;
use App\Repository\TaskTemplateRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * A reusable template with default values for new tasks (docs/analisis.md §3).
 *
 * Templates are deleted for good (no trash), but only while no task comes
 * from them (RN-12, checked by TaskTemplateService).
 */
#[ORM\Entity(repositoryClass: TaskTemplateRepository::class)]
#[ORM\Table(name: 'task_template')]
class TaskTemplate
{
    public const TITLE_MAX_LENGTH = Task::TITLE_MAX_LENGTH;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: self::TITLE_MAX_LENGTH)]
    private string $title;

    #[ORM\Column(length: 10, nullable: true, enumType: Recurrence::class)]
    private ?Recurrence $recurrence = null;

    public function __construct(string $title, ?Recurrence $recurrence = null)
    {
        $this->setTitle($title);
        $this->setRecurrence($recurrence);
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    /**
     * RN-07: the title of a template is mandatory.
     */
    public function setTitle(string $title): void
    {
        $title = trim($title);

        if ('' === $title) {
            throw new DomainRuleViolation('RN-07: the template title is mandatory.');
        }
        if (mb_strlen($title) > self::TITLE_MAX_LENGTH) {
            throw new DomainRuleViolation(sprintf('RN-07: the template title cannot exceed %d characters.', self::TITLE_MAX_LENGTH));
        }

        $this->title = $title;
    }

    public function getRecurrence(): ?Recurrence
    {
        return $this->recurrence;
    }

    /**
     * RN-07, RN-03: null (not recurring) or one of the enum values. A template
     * has no next occurrence date: it is calculated when a task is created.
     */
    public function setRecurrence(?Recurrence $recurrence): void
    {
        $this->recurrence = $recurrence;
    }
}
