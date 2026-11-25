<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Recurrence;

/**
 * Calculates the date of the next occurrence of a recurring task (RN-05, RN-18).
 */
final class RecurrenceCalculator
{
    /**
     * Adds one day, one week or one month to the given date. With months, if
     * the day does not exist in the next month the last day of that month is
     * used (31 January -> 28/29 February).
     */
    public function next(\DateTimeImmutable $from, Recurrence $recurrence): \DateTimeImmutable
    {
        $from = $from->setTime(0, 0);

        return match ($recurrence) {
            Recurrence::Daily => $from->modify('+1 day'),
            Recurrence::Weekly => $from->modify('+1 week'),
            Recurrence::Monthly => $this->addOneMonth($from),
        };
    }

    private function addOneMonth(\DateTimeImmutable $from): \DateTimeImmutable
    {
        $firstOfNextMonth = $from->modify('first day of next month');
        $day = min((int) $from->format('j'), (int) $firstOfNextMonth->format('t'));

        return $firstOfNextMonth->setDate(
            (int) $firstOfNextMonth->format('Y'),
            (int) $firstOfNextMonth->format('n'),
            $day,
        );
    }
}
