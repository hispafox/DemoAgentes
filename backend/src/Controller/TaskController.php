<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\CompleteTaskOutput;
use App\Dto\TaskInput;
use App\Dto\TaskOutput;
use App\Service\TaskService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

/**
 * HTTP layer for /api/tasks (docs/analisis.md §4).
 *
 * Issue #5 covers list, detail, create and update, #6 complete and #7 the
 * trash (delete, list and restore).
 */
// format: 'json' makes errors render as JSON even without an Accept header.
#[Route('/api/tasks', name: 'api_tasks_', format: 'json')]
final class TaskController extends AbstractController
{
    public function __construct(
        private readonly TaskService $taskService,
    ) {
    }

    // F-01: list tasks
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return $this->json(array_map(TaskOutput::fromEntity(...), $this->taskService->list()));
    }

    // F-13: list the trash (the \d+ requirement on {id} keeps /trash apart)
    #[Route('/trash', name: 'trash', methods: ['GET'])]
    public function trash(): JsonResponse
    {
        return $this->json(array_map(TaskOutput::fromEntity(...), $this->taskService->listTrash()));
    }

    // F-02: task detail
    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        return $this->json(TaskOutput::fromEntity($this->taskService->getTask($id)));
    }

    // F-03: create a task (RN-01 to RN-04, RN-18)
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(#[MapRequestPayload] TaskInput $input): JsonResponse
    {
        $task = $this->taskService->create($input);

        return $this->json(
            TaskOutput::fromEntity($task),
            JsonResponse::HTTP_CREATED,
            ['Location' => $this->generateUrl('api_tasks_show', ['id' => $task->getId()])],
        );
    }

    // F-04: update title and recurrence (RN-01, RN-03, RN-04, RN-18)
    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, #[MapRequestPayload] TaskInput $input): JsonResponse
    {
        $task = $this->taskService->update($this->taskService->getTask($id), $input);

        return $this->json(TaskOutput::fromEntity($task));
    }

    // F-06: complete a task and, if recurring, create the next occurrence (RN-05, RN-06, RN-11)
    #[Route('/{id}/complete', name: 'complete', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function complete(int $id): JsonResponse
    {
        $result = $this->taskService->complete($this->taskService->getTask($id));

        return $this->json(CompleteTaskOutput::fromResult($result));
    }

    // F-05: move a task to the trash (RN-10, RN-13)
    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): Response
    {
        $this->taskService->moveToTrash($this->taskService->getTask($id));

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    // F-14: restore a task from the trash (RN-10)
    #[Route('/{id}/restore', name: 'restore', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function restore(int $id): JsonResponse
    {
        return $this->json(TaskOutput::fromEntity($this->taskService->restore($id)));
    }
}
