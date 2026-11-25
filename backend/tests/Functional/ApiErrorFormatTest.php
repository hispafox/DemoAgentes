<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Smoke test for HTTP tests: the test client works and API errors follow the
 * Problem Details format (RFC 9457), including the "application/problem+json"
 * content type configured in framework.yaml (issue #5).
 */
final class ApiErrorFormatTest extends WebTestCase
{
    public function testUnknownApiRouteReturnsProblemDetails404(): void
    {
        $client = self::createClient();

        $client->request('GET', '/api/does-not-exist', server: ['HTTP_ACCEPT' => 'application/json']);

        self::assertResponseStatusCodeSame(404);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');

        $body = json_decode((string) $client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame(404, $body['status']);
        self::assertArrayHasKey('title', $body);
        self::assertArrayHasKey('type', $body);
    }
}
