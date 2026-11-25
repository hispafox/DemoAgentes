<?php

declare(strict_types=1);

namespace App\Entity\Exception;

/**
 * Thrown when an operation would break a business rule (RN-xx) of an entity.
 *
 * The API layer translates it into an error response; the message names the rule.
 */
final class DomainRuleViolation extends \DomainException
{
}
