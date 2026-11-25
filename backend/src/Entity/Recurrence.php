<?php

declare(strict_types=1);

namespace App\Entity;

/**
 * How often a recurring task repeats (RN-04: only these three values exist).
 */
enum Recurrence: string
{
    case Daily = 'daily';
    case Weekly = 'weekly';
    case Monthly = 'monthly';
}
