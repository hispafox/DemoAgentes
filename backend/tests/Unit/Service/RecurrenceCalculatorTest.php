<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Recurrence;
use App\Service\RecurrenceCalculator;
use PHPUnit\Framework\TestCase;

/**
 * Next occurrence date: today + 1 day, 1 week or 1 month (RN-05, RN-18).
 */
final class RecurrenceCalculatorTest extends TestCase
{
    private RecurrenceCalculator $calculator;

    protected function setUp(): void
    {
        $this->calculator = new RecurrenceCalculator();
    }

    // RN-05
    public function testDailyAddsOneDay(): void
    {
        self::assertSame('2026-11-26', $this->next('2026-11-25', Recurrence::Daily));
    }

    // RN-05
    public function testWeeklyAddsSevenDays(): void
    {
        self::assertSame('2026-12-02', $this->next('2026-11-25', Recurrence::Weekly));
    }

    // RN-05
    public function testMonthlyAddsOneMonth(): void
    {
        self::assertSame('2026-12-25', $this->next('2026-11-25', Recurrence::Monthly));
    }

    // RN-05: the day does not exist in the next month -> last day of that month
    public function testMonthlyFromTheEndOfJanuaryEndsOnTheLastDayOfFebruary(): void
    {
        self::assertSame('2027-02-28', $this->next('2027-01-31', Recurrence::Monthly));
    }

    // RN-05: leap year
    public function testMonthlyFromTheEndOfJanuaryInALeapYearEndsOnFebruary29(): void
    {
        self::assertSame('2028-02-29', $this->next('2028-01-31', Recurrence::Monthly));
    }

    // RN-05: across the end of the year
    public function testMonthlyFromDecemberMovesToJanuaryOfTheNextYear(): void
    {
        self::assertSame('2027-01-15', $this->next('2026-12-15', Recurrence::Monthly));
    }

    // The result is a date: the time of the day is dropped
    public function testTheTimeOfTheDayIsDropped(): void
    {
        $next = $this->calculator->next(new \DateTimeImmutable('2026-11-25 18:45:00'), Recurrence::Daily);

        self::assertSame('2026-11-26 00:00:00', $next->format('Y-m-d H:i:s'));
    }

    private function next(string $from, Recurrence $recurrence): string
    {
        return $this->calculator->next(new \DateTimeImmutable($from), $recurrence)->format('Y-m-d');
    }
}
