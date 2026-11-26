<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\TaskOutput;
use App\Dto\TaskTemplateInput;
use App\Dto\TaskTemplateOutput;
use App\Service\TaskTemplateService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

/**
 * HTTP layer for /api/task-templates (docs/analisis.md §4).
 *
 * Issue #8 covers the CRUD and #9 instantiate.
 */
// format: 'json' makes errors render as JSON even without an Accept header;
// for /api requests that match no route, see ApiJsonFormatSubscriber.
#[Route('/api/task-templates', name: 'api_task_templates_', format: 'json')]
final class TaskTemplateController extends AbstractController
{
    public function __construct(
        private readonly TaskTemplateService $templateService,
    ) {
    }

    // F-07: list templates
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return $this->json(array_map(TaskTemplateOutput::fromEntity(...), $this->templateService->list()));
    }

    // F-08: template detail
    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        return $this->json(TaskTemplateOutput::fromEntity($this->templateService->getTemplate($id)));
    }

    // F-09: create a template (RN-07)
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(#[MapRequestPayload] TaskTemplateInput $input): JsonResponse
    {
        $template = $this->templateService->create($input);

        return $this->json(
            TaskTemplateOutput::fromEntity($template),
            JsonResponse::HTTP_CREATED,
            ['Location' => $this->generateUrl('api_task_templates_show', ['id' => $template->getId()])],
        );
    }

    // F-10: update a template; its tasks do not change (RN-07, RN-09)
    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, #[MapRequestPayload] TaskTemplateInput $input): JsonResponse
    {
        $template = $this->templateService->update($this->templateService->getTemplate($id), $input);

        return $this->json(TaskTemplateOutput::fromEntity($template));
    }

    // F-11: delete a template for good, only without tasks (RN-12)
    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): Response
    {
        $this->templateService->delete($this->templateService->getTemplate($id));

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    // F-12: create a task from the template (RN-08, RN-18)
    #[Route('/{id}/instantiate', name: 'instantiate', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function instantiate(int $id): JsonResponse
    {
        $task = $this->templateService->instantiate($this->templateService->getTemplate($id));

        return $this->json(
            TaskOutput::fromEntity($task),
            JsonResponse::HTTP_CREATED,
            ['Location' => $this->generateUrl('api_tasks_show', ['id' => $task->getId()])],
        );
    }
}
