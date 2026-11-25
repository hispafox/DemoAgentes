<?php

declare(strict_types=1);

namespace App\Service;

use App\Dto\TaskTemplateInput;
use App\Entity\Exception\DomainRuleViolation;
use App\Entity\Task;
use App\Entity\TaskTemplate;
use App\Repository\TaskRepository;
use App\Repository\TaskTemplateRepository;
use App\Service\Exception\ResourceNotFound;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Clock\ClockInterface;

/**
 * Business logic for task templates (docs/analisis.md §5).
 *
 * Issue #8 covers the CRUD and #9 creating a task from a template (instantiate).
 */
final class TaskTemplateService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly TaskTemplateRepository $templateRepository,
        private readonly TaskRepository $taskRepository,
        private readonly RecurrenceCalculator $recurrenceCalculator,
        private readonly ClockInterface $clock,
    ) {
    }

    /**
     * F-07: all templates, in creation order.
     *
     * @return list<TaskTemplate>
     */
    public function list(): array
    {
        return $this->templateRepository->findBy([], ['id' => 'ASC']);
    }

    /**
     * F-08: a template by id.
     *
     * @throws ResourceNotFound if it does not exist
     */
    public function getTemplate(int $id): TaskTemplate
    {
        return $this->templateRepository->find($id) ?? throw ResourceNotFound::template($id);
    }

    /**
     * F-09, RN-07: creates a template.
     */
    public function create(TaskTemplateInput $input): TaskTemplate
    {
        $template = new TaskTemplate($input->title, $input->recurrence);

        $this->entityManager->persist($template);
        $this->entityManager->flush();

        return $template;
    }

    /**
     * F-10, RN-07, RN-09: changes the template. The tasks already created from
     * it keep their own values: they copied them, they do not read the template.
     */
    public function update(TaskTemplate $template, TaskTemplateInput $input): TaskTemplate
    {
        $template->setTitle($input->title);
        $template->setRecurrence($input->recurrence);

        $this->entityManager->flush();

        return $template;
    }

    /**
     * F-11, RN-12: deletes the template for good, only if no task comes from
     * it (tasks in the trash count too).
     *
     * @throws DomainRuleViolation if it has tasks (409)
     */
    public function delete(TaskTemplate $template): void
    {
        if ($this->taskRepository->countByTemplate($template) > 0) {
            throw new DomainRuleViolation('RN-12: a template with tasks cannot be deleted.');
        }

        $this->entityManager->remove($template);
        $this->entityManager->flush();
    }

    /**
     * F-12, RN-08, RN-02, RN-18: creates a pending task with the title and
     * recurrence of the template, linked to it. If recurring, its next
     * occurrence is today + recurrence.
     */
    public function instantiate(TaskTemplate $template): Task
    {
        $now = $this->clock->now();
        $recurrence = $template->getRecurrence();

        $task = new Task(
            $template->getTitle(),
            $now,
            $recurrence,
            null === $recurrence ? null : $this->recurrenceCalculator->next($now, $recurrence),
            $template,
        );

        $this->entityManager->persist($task);
        $this->entityManager->flush();

        return $task;
    }
}
