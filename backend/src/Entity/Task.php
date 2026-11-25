<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\Exception\DomainRuleViolation;
use App\Repository\TaskRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * A personal task (docs/analisis.md §3).
 *
 * Issue #5 covers the base fields, #6 completing, #7 the trash and #8 the
 * link to a template.
 */
#[ORM\Entity(repositoryClass: TaskRepository::class)]
#[ORM\Table(name: 'task')]
class Task
{
    public const TITLE_MAX_LENGTH = 255;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: self::TITLE_MAX_LENGTH)]
    private string $title;

    #[ORM\Column(options: ['default' => false])]
    private bool $completed = false;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(length: 10, nullable: true, enumType: Recurrence::class)]
    private ?Recurrence $recurrence = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $nextOccurrenceDate = null;

    /** When the task was moved to the trash; null = active (RN-10). */
    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $deletedAt = null;

    /** Template the task was created from; null = created by hand (RN-08, RN-12). */
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'RESTRICT')]
    private ?TaskTemplate $template = null;

    /**
     * RN-02: a new task is always pending and its creation date is set by the system.
     */
    public function __construct(
        string $title,
        \DateTimeImmutable $now,
        ?Recurrence $recurrence = null,
        ?\DateTimeImmutable $nextOccurrenceDate = null,
        ?TaskTemplate $template = null,
    ) {
        $this->setTitle($title);
        $this->createdAt = $now;
        $this->setRecurrence($recurrence, $nextOccurrenceDate);
        $this->template = $template;
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
     * RN-01: the title is mandatory.
     */
    public function setTitle(string $title): void
    {
        $title = trim($title);

        if ('' === $title) {
            throw new DomainRuleViolation('RN-01: the task title is mandatory.');
        }
        if (mb_strlen($title) > self::TITLE_MAX_LENGTH) {
            throw new DomainRuleViolation(sprintf('RN-01: the task title cannot exceed %d characters.', self::TITLE_MAX_LENGTH));
        }

        $this->title = $title;
    }

    public function isCompleted(): bool
    {
        return $this->completed;
    }

    /**
     * RN-11: a completed task cannot be completed again, and there is no way
     * back to pending.
     */
    public function complete(): void
    {
        if ($this->completed) {
            throw new DomainRuleViolation('RN-11: the task is already completed.');
        }

        $this->completed = true;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getRecurrence(): ?Recurrence
    {
        return $this->recurrence;
    }

    public function getNextOccurrenceDate(): ?\DateTimeImmutable
    {
        return $this->nextOccurrenceDate;
    }

    /**
     * RN-03: a recurring task has a recurrence; a non-recurring task has neither
     * recurrence nor next occurrence date.
     */
    public function setRecurrence(?Recurrence $recurrence, ?\DateTimeImmutable $nextOccurrenceDate = null): void
    {
        if (null === $recurrence && null !== $nextOccurrenceDate) {
            throw new DomainRuleViolation('RN-03: a non-recurring task cannot have a next occurrence date.');
        }

        $this->recurrence = $recurrence;
        $this->nextOccurrenceDate = $nextOccurrenceDate;
    }

    /**
     * Derived from the recurrence instead of a redundant column (docs/analisis.md §9).
     */
    public function isRecurring(): bool
    {
        return null !== $this->recurrence;
    }

    public function getDeletedAt(): ?\DateTimeImmutable
    {
        return $this->deletedAt;
    }

    /**
     * Derived from deletedAt instead of a redundant column.
     */
    public function isDeleted(): bool
    {
        return null !== $this->deletedAt;
    }

    /**
     * RN-10: deleting a task moves it to the trash; it is never removed.
     */
    public function moveToTrash(\DateTimeImmutable $now): void
    {
        if ($this->isDeleted()) {
            throw new DomainRuleViolation('RN-10: the task is already in the trash.');
        }

        $this->deletedAt = $now;
    }

    /**
     * RN-10: a task in the trash can be restored, keeping its status.
     */
    public function restore(): void
    {
        if (!$this->isDeleted()) {
            throw new DomainRuleViolation('RN-10: only a task in the trash can be restored.');
        }

        $this->deletedAt = null;
    }

    /**
     * RN-08: set only when the task is created; it never changes afterwards.
     */
    public function getTemplate(): ?TaskTemplate
    {
        return $this->template;
    }
}
