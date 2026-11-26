<?php

declare(strict_types=1);

namespace App\Service\Exception;

/**
 * Thrown when a requested resource does not exist. The API translates it into a 404.
 */
final class ResourceNotFound extends \RuntimeException
{
    public static function task(int $id): self
    {
        return new self(sprintf('Task %d not found.', $id));
    }

    public static function template(int $id): self
    {
        return new self(sprintf('Task template %d not found.', $id));
    }

    public static function category(int $id): self
    {
        return new self(sprintf('Category %d not found.', $id));
    }
}
