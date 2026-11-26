<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\Exception\DomainRuleViolation;
use App\Repository\CategoryRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * A category that groups tasks (docs/analisis.md §3, version 0.2).
 *
 * Categories are deleted for good, but only while no task uses them (RN-16,
 * checked by CategoryService). The name is unique ignoring case and
 * surrounding spaces (RN-17): CategoryService checks it, and the unique index
 * is a second barrier for exact duplicates.
 */
#[ORM\Entity(repositoryClass: CategoryRepository::class)]
#[ORM\Table(name: 'category')]
#[ORM\UniqueConstraint(name: 'uniq_category_name', columns: ['name'])]
class Category
{
    public const NAME_MAX_LENGTH = 100;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: self::NAME_MAX_LENGTH)]
    private string $name;

    public function __construct(string $name)
    {
        $this->rename($name);
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    /**
     * RN-14: the name is mandatory; surrounding spaces are removed.
     */
    public function rename(string $name): void
    {
        $name = trim($name);

        if ('' === $name) {
            throw new DomainRuleViolation('RN-14: the category name is mandatory.');
        }
        if (mb_strlen($name) > self::NAME_MAX_LENGTH) {
            throw new DomainRuleViolation(sprintf('RN-14: the category name cannot exceed %d characters.', self::NAME_MAX_LENGTH));
        }

        $this->name = $name;
    }
}
