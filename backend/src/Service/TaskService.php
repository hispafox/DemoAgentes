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
 * Issue #5 covers listing, reading, creating and updating. Completing (#6) and
 * the trash (#7) are added by their own issues.
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
     * F-01: all tasks, oldest first.
     *
     * @return list<Task>
     */
    public function list(): array
    {
        return $this->taskRepository->findBy([], ['createdAt' => 'ASC', 'id' => 'ASC']);
    }

    /**
     * F-02: a task by id.
     *
     * @throws ResourceNotFound if it does not exist
     */
    public function getTask(int $id): Task
    {
        return $this->taskRepository->find($id) ?? throw ResourceNotFound::task($id);
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

    private function nextOccurrenceDate(?Recurrence $recurrence): ?\DateTimeImmutable
    {
        if (null === $recurrence) {
            return null;
        }

        return $this->recurrenceCalculator->next($this->clock->now(), $recurrence);
    }
}
