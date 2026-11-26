<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Category;
use App\Entity\Exception\DomainRuleViolation;
use PHPUnit\Framework\TestCase;

/**
 * Domain rules of Category (RN-14, issue #15).
 */
final class CategoryTest extends TestCase
{
    // RN-14: surrounding spaces are removed
    public function testNewCategoryKeepsTheTrimmedName(): void
    {
        self::assertSame('Home', (new Category('  Home  '))->getName());
    }

    // RN-14
    public function testConstructorRejectsBlankName(): void
    {
        $this->expectException(DomainRuleViolation::class);

        new Category('   ');
    }

    // F-17, RN-14
    public function testRenameChangesTheName(): void
    {
        $category = new Category('Home');

        $category->rename(' Work ');

        self::assertSame('Work', $category->getName());
    }

    // RN-14
    public function testRenameRejectsBlankName(): void
    {
        $category = new Category('Home');

        try {
            $category->rename('');
            self::fail('A DomainRuleViolation was expected.');
        } catch (DomainRuleViolation) {
            self::assertSame('Home', $category->getName());
        }
    }

    // RN-14: varchar(100)
    public function testNameLongerThanTheMaximumIsRejected(): void
    {
        $this->expectException(DomainRuleViolation::class);

        new Category(str_repeat('a', Category::NAME_MAX_LENGTH + 1));
    }
}
