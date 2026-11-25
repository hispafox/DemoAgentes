<?php

declare(strict_types=1);

namespace App\Service;

use App\Dto\TaskInput;
use App\Entity\Recurrence;
use App\Entity\Task;
use App\Repository\TaskRepository;
use App\Service\Exception\ResourceNotFound;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Clock\ClockInterface;

/**
 * Business logic for tasks (docs/analisis.md §5).
 *
 * Issue #5 covers listing, reading, creating and updating, #6 completing and
 * #7 the trash. Creating a task from a template is TaskTemplateService (#9).
 */
final class TaskService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly TaskRepository $taskRepository,
        private readonly RecurrenceCalculator $recurrenceCalculator,
        private readonly ClockInterface $clock,
    ) {
    }

    /**
     * F-01, RN-10: active tasks (not in the trash), oldest first.
     *
     * @return list<Task>
     */
    public function list(): array
    {
        return $this->taskRepository->findActive();
    }

    /**
     * F-13: tasks in the trash.
     *
     * @return list<Task>
     */
    public function listTrash(): array
    {
        return $this->taskRepository->findDeleted();
    }

    /**
     * F-02, RN-13: an active task by id. A task in the trash counts as not found.
     *
     * @throws ResourceNotFound if it does not exist or is in the trash
     */
    public function getTask(int $id): Task
    {
        $task = $this->taskRepository->find($id);
        if (null === $task || $task->isDeleted()) {
            throw ResourceNotFound::task($id);
        }

        return $task;
    }

    /**
     * F-05, RN-10: moves the task to the trash; it is never removed.
     */
    public function moveToTrash(Task $task): void
    {
        $task->moveToTrash($this->clock->now());
        $this->entityManager->flush();
    }

    /**
     * F-14, RN-10: restores a task from the trash, keeping its status.
     *
     * @throws ResourceNotFound if the task does not exist
     * @throws \App\Entity\Exception\DomainRuleViolation if it is not in the trash (409)
     */
    public function restore(int $id): Task
    {
        $task = $this->taskRepository->find($id) ?? throw ResourceNotFound::task($id);
        $task->restore();
        $this->entityManager->flush();

        return $task;
    }

    /**
     * F-03, RN-02, RN-18: creates a pending task; if recurring, its next
     * occurrence is today + recurrence.
     */
    public function create(TaskInput $input): Task
    {
        $now = $this->clock->now();
        $task = new Task(
            $input->title,
            $now,
            $input->recurrence,
            $this->nextOccurrenceDate($input->recurrence),
        );

        $this->entityManager->persist($task);
        $this->entityManager->flush();

        return $task;
    }

    /**
     * F-04, RN-03, RN-18: changes the title and the recurrence. The next
     * occurrence date is recalculated from today only if the recurrence changes.
     * The status cannot be changed here (RN-11).
     */
    public function update(Task $task, TaskInput $input): Task
    {
        $task->setTitle($input->title);

        if ($input->recurrence !== $task->getRecurrence()) {
            $task->setRecurrence($input->recurrence, $this->nextOccurrenceDate($input->recurrence));
        }

        $this->entityManager->flush();

        return $task;
    }

    /**
     * F-06, RN-11, RN-05, RN-06: completes the task and, if it is recurring,
     * creates the next occurrence (same title, recurrence and template, pending, with
     * today + recurrence as its date). Both are saved in a single flush.
     *
     * @throws \App\Entity\Exception\DomainRuleViolation if it is already completed (RN-11)
     */
    public function complete(Task $task): CompleteResult
    {
        $task->complete();

        $nextOccurrence = null;
        if ($task->isRecurring()) {
            $nextOccurrence = new Task(
                $task->getTitle(),
                $this->clock->now(),
                $task->getRecurrence(),
                $this->nextOccurrenceDate($task->getRecurrence()),
                $task->getTemplate(),
            );
            $this->entityManager->persist($nextOccurrence);
        }

        $this->entityManager->flush();

        return new CompleteResult($task, $nextOccurrence);
    }

    private function nextOccurrenceDate(?Recurrence $recurrence): ?\DateTimeImmutable
    {
        if (null === $recurrence) {
            return null;
        }

        return $this->recurrenceCalculator->next($this->clock->now(), $recurrence);
    }
}
