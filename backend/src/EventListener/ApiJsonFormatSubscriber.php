<?php

declare(strict_types=1);

namespace App\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Makes every /api request use the "json" format before routing (issue #23).
 *
 * The "format: 'json'" of the API controllers only applies when a route
 * matches. Requests that match no route (/api/nope, /api/tasks/abc) or use a
 * verb the route does not allow (PATCH /api/tasks/1) fail inside the router,
 * so without this subscriber their 404/405 errors would render as HTML. With
 * the "json" format they render as application/problem+json, the first MIME
 * type of that format in framework.yaml (docs/analisis.md §4, "Formato de
 * errores"). Requests outside /api are left untouched.
 */
final class ApiJsonFormatSubscriber implements EventSubscriberInterface
{
    // Must run before Symfony's RouterListener (priority 32), which throws
    // the 404/405 exceptions for unmatched routes.
    private const PRIORITY = 33;

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', self::PRIORITY],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        $path = $request->getPathInfo();

        if ('/api' === $path || str_starts_with($path, '/api/')) {
            $request->attributes->set('_format', 'json');
        }
    }
}
