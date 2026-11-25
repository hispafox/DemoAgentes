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
 * Issue #5 covers the base fields. Completing (#6), the trash (#7) and the
 * link to a template (#8) are added by their own issues.
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

    /**
     * RN-02: a new task is always pending and its creation date is set by the system.
     */
    public function __construct(
        string $title,
        \DateTimeImmutable $now,
        ?Recurrence $recurrence = null,
        ?\DateTimeImmutable $nextOccurrenceDate = null,
    ) {
        $this->setTitle($title);
        $this->createdAt = $now;
        $this->setRecurrence($recurrence, $nextOccurrenceDate);
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
}
