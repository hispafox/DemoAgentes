<?php

declare(strict_types=1);

namespace App\Dto;

use App\Entity\Category;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Body of POST and PUT /api/categories (docs/analisis.md §4, version 0.2).
 *
 * The uniqueness of the name (RN-17) needs the database, so it is checked by
 * CategoryService, not here.
 */
final readonly class CategoryInput
{
    public function __construct(
        #[Assert\NotBlank(normalizer: 'trim')] // RN-14
        #[Assert\Length(max: Category::NAME_MAX_LENGTH)] // RN-14
        public string $name = '',
    ) {
    }
}
