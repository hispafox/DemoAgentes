<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Smoke test for HTTP tests: the test client works and API errors already
 * follow the Problem Details structure (RFC 9457) out of the box.
 *
 * The analysis also requires the "application/problem+json" content type;
 * Symfony sends "application/json" by default. That belongs to error
 * handling and is covered in issue #5.
 */
final class ApiErrorFormatTest extends WebTestCase
{
    public function testUnknownApiRouteReturnsProblemDetails404(): void
    {
        $client = self::createClient();

        $client->request('GET', '/api/does-not-exist', server: ['HTTP_ACCEPT' => 'application/json']);

        self::assertResponseStatusCodeSame(404);

        $body = json_decode((string) $client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame(404, $body['status']);
        self::assertArrayHasKey('title', $body);
        self::assertArrayHasKey('type', $body);
    }
}
