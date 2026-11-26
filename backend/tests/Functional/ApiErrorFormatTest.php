<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * API errors follow the Problem Details format (RFC 9457), including the
 * "application/problem+json" content type configured in framework.yaml
 * (issue #5), also for /api requests that match no route (issue #23).
 *
 * The test client sends a browser-like "Accept: text/html,..." header by
 * default; "without Accept" means an empty Accept header here.
 */
final class ApiErrorFormatTest extends WebTestCase
{
    public function testUnknownApiRouteReturnsProblemDetails404(): void
    {
        $client = self::createClient();

        $client->request('GET', '/api/does-not-exist', server: ['HTTP_ACCEPT' => 'application/json']);

        self::assertResponseStatusCodeSame(404);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');

        $body = $this->decodeBody($client);
        self::assertSame(404, $body['status']);
        self::assertArrayHasKey('title', $body);
        self::assertArrayHasKey('type', $body);
    }

    // CA 1 (#23): unknown /api route without Accept -> 404 problem+json
    public function testUnknownApiRouteWithoutAcceptReturnsProblemJson404(): void
    {
        $client = self::createClient();

        $client->request('GET', '/api/nope', server: ['HTTP_ACCEPT' => '']);

        self::assertResponseStatusCodeSame(404);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
        self::assertSame(404, $this->decodeBody($client)['status']);
    }

    // CA 2 (#23): GET /api/tasks/abc -> 404 problem+json, even when the
    // client prefers HTML (the test client's default Accept header)
    public function testNonNumericIdWithoutAcceptReturnsProblemJson404(): void
    {
        $client = self::createClient();

        $client->request('GET', '/api/tasks/abc');

        self::assertResponseStatusCodeSame(404);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
        self::assertSame(404, $this->decodeBody($client)['status']);
    }

    // CA 3 (#23): PATCH /api/tasks/1 -> 405 problem+json, keeping the Allow header
    public function testMethodNotAllowedReturnsProblemJson405(): void
    {
        $client = self::createClient();

        $client->request('PATCH', '/api/tasks/1', server: ['HTTP_ACCEPT' => '']);

        self::assertResponseStatusCodeSame(405);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
        self::assertSame(405, $this->decodeBody($client)['status']);

        $allow = (string) $client->getResponse()->headers->get('Allow');
        self::assertStringContainsString('GET', $allow);
        self::assertStringContainsString('PUT', $allow);
        self::assertStringContainsString('DELETE', $allow);
    }

    // CA 4 (#23): routes outside /api keep Symfony's default behaviour
    public function testNonApiRouteIsNotAffected(): void
    {
        $client = self::createClient();

        $client->request('GET', '/', server: ['HTTP_ACCEPT' => '']);

        self::assertResponseStatusCodeSame(404);
        self::assertStringStartsNotWith(
            'application/problem+json',
            (string) $client->getResponse()->headers->get('Content-Type'),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeBody(KernelBrowser $client): array
    {
        $body = json_decode((string) $client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertIsArray($body);

        return $body;
    }
}
