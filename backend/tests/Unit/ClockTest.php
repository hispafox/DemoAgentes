<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;

/**
 * Smoke test for the unit suite: proves that tests can freeze "now",
 * which the domain needs for createdAt and recurrence dates (RN-02, RN-05).
 */
final class ClockTest extends TestCase
{
    public function testMockClockReturnsTheFrozenDate(): void
    {
        $clock = new MockClock('2026-01-31 10:00:00');

        self::assertSame('2026-01-31 10:00:00', $clock->now()->format('Y-m-d H:i:s'));
    }

    public function testMockClockAdvancesOnlyWhenAsked(): void
    {
        $clock = new MockClock('2026-01-31 10:00:00');

        $clock->modify('+1 day');

        self::assertSame('2026-02-01', $clock->now()->format('Y-m-d'));
    }
}
