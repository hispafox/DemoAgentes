<?php

declare(strict_types=1);

namespace App\Dto;

use App\Entity\Category;

/**
 * Category as returned by the API (docs/analisis.md §4, version 0.2).
 */
final readonly class CategoryOutput
{
    public function __construct(
        public int $id,
        public string $name,
    ) {
    }

    public static function fromEntity(Category $category): self
    {
        return new self(
            id: (int) $category->getId(),
            name: $category->getName(),
        );
    }
}
