<?php

declare(strict_types=1);

namespace App\Service;

use App\Dto\TaskTemplateInput;
use App\Entity\Exception\DomainRuleViolation;
use App\Entity\TaskTemplate;
use App\Repository\TaskRepository;
use App\Repository\TaskTemplateRepository;
use App\Service\Exception\ResourceNotFound;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Business logic for task templates (docs/analisis.md §5).
 *
 * Issue #8 covers the CRUD. Creating a task from a template (instantiate)
 * arrives with issue #9.
 */
final class TaskTemplateService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly TaskTemplateRepository $templateRepository,
        private readonly TaskRepository $taskRepository,
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
}
