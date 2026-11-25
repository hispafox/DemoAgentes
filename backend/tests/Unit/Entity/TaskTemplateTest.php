<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Exception\DomainRuleViolation;
use App\Entity\Recurrence;
use App\Entity\TaskTemplate;
use PHPUnit\Framework\TestCase;

/**
 * Domain rules of TaskTemplate (RN-07).
 */
final class TaskTemplateTest extends TestCase
{
    // RN-07
    public function testNewTemplateKeepsTheTrimmedTitleAndTheRecurrence(): void
    {
        $template = new TaskTemplate('  Water the plants  ', Recurrence::Weekly);

        self::assertSame('Water the plants', $template->getTitle());
        self::assertSame(Recurrence::Weekly, $template->getRecurrence());
    }

    // RN-07
    public function testBlankTitleIsRejected(): void
    {
        $this->expectException(DomainRuleViolation::class);

        new TaskTemplate('   ');
    }

    // RN-07
    public function testTitleLongerThanTheMaximumIsRejected(): void
    {
        $this->expectException(DomainRuleViolation::class);

        new TaskTemplate(str_repeat('a', TaskTemplate::TITLE_MAX_LENGTH + 1));
    }

    // RN-07, RN-03: a template can stop being recurring
    public function testRecurrenceCanBeRemoved(): void
    {
        $template = new TaskTemplate('Water the plants', Recurrence::Weekly);

        $template->setRecurrence(null);

        self::assertNull($template->getRecurrence());
    }
}
