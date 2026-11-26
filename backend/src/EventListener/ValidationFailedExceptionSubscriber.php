<?php

declare(strict_types=1);

namespace App\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Validator\Exception\ValidationFailedException;

/**
 * Turns a ValidationFailedException thrown by a service into a 422 (issue #15).
 *
 * Some rules need the database and are checked by the services, not by the
 * DTO: a duplicate category name (RN-17) or an unknown categoryId (F-19). The
 * services throw a ValidationFailedException with the violation on the field.
 * Wrapping it in a 422 HTTP exception, as #[MapRequestPayload] does, makes
 * Symfony render the same problem+json with "violations" as any other
 * validation error (docs/analisis.md §4, "Formato de errores").
 */
final class ValidationFailedExceptionSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::EXCEPTION => 'onKernelException',
        ];
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        if (!$exception instanceof ValidationFailedException) {
            return;
        }

        $messages = [];
        foreach ($exception->getViolations() as $violation) {
            $messages[] = $violation->getPropertyPath().': '.$violation->getMessage();
        }

        $event->setThrowable(new UnprocessableEntityHttpException(implode("\n", $messages), $exception));
    }
}
