<?php

declare(strict_types=1);

namespace App\Tests\Functional\Controller;

use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Clock\Test\ClockSensitiveTrait;

/**
 * Acceptance criteria of issues #8 and #9 on /api/task-templates (F-07 to F-12).
 */
final class TaskTemplateControllerTest extends WebTestCase
{
    use ClockSensitiveTrait;

    private KernelBrowser $client;

    protected function setUp(): void
    {
        self::mockTime('2026-11-25 10:00:00');
        $this->client = self::createClient();
    }

    // CA: valid title -> 201 with the template and its Location
    public function testCreateReturns201WithLocation(): void
    {
        $this->client->jsonRequest('POST', '/api/task-templates', ['title' => 'Water the plants', 'recurrence' => 'weekly']);

        self::assertResponseStatusCodeSame(201);
        $template = $this->body();
        self::assertResponseHeaderSame('Location', '/api/task-templates/'.$template['id']);
        self::assertSame('Water the plants', $template['title']);
        self::assertSame('weekly', $template['recurrence']);
    }

    // CA: blank title -> 422 in problem+json (RN-07)
    public function testCreateWithBlankTitleReturns422(): void
    {
        $this->client->jsonRequest('POST', '/api/task-templates', ['title' => '  ']);

        self::assertResponseStatusCodeSame(422);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
        self::assertSame('title', $this->body()['violations'][0]['propertyPath']);
    }

    // CA: unknown recurrence -> 422 (RN-07, RN-03)
    public function testCreateWithUnknownRecurrenceReturns422(): void
    {
        $this->client->jsonRequest('POST', '/api/task-templates', ['title' => 'Pay rent', 'recurrence' => 'yearly']);

        self::assertResponseStatusCodeSame(422);
        self::assertSame('recurrence', $this->body()['violations'][0]['propertyPath']);
    }

    // CA: list and detail
    public function testListAndDetailReturnTheTemplates(): void
    {
        $first = $this->createTemplate(['title' => 'Water the plants', 'recurrence' => 'weekly']);
        $second = $this->createTemplate(['title' => 'Pay rent', 'recurrence' => 'monthly']);

        $this->client->request('GET', '/api/task-templates');
        self::assertResponseIsSuccessful();
        self::assertSame([$first, $second], array_column($this->body(), 'id'));

        $this->client->request('GET', '/api/task-templates/'.$second);
        self::assertResponseIsSuccessful();
        self::assertSame(['id' => $second, 'title' => 'Pay rent', 'recurrence' => 'monthly'], $this->body());
    }

    // CA: unknown id -> 404 on detail, update and delete
    public function testUnknownTemplateReturns404(): void
    {
        $this->client->request('GET', '/api/task-templates/999999');
        self::assertResponseStatusCodeSame(404);

        $this->client->jsonRequest('PUT', '/api/task-templates/999999', ['title' => 'Pay rent']);
        self::assertResponseStatusCodeSame(404);

        $this->client->request('DELETE', '/api/task-templates/999999');
        self::assertResponseStatusCodeSame(404);
    }

    // CA: updating a template does not change the tasks created from it (RN-09)
    public function testUpdateDoesNotChangeTheTasksOfTheTemplate(): void
    {
        $templateId = $this->createTemplate(['title' => 'Water the plants', 'recurrence' => 'weekly']);
        $taskId = $this->createTaskFromTemplate($templateId);

        $this->client->jsonRequest('PUT', '/api/task-templates/'.$templateId, ['title' => 'Water the garden', 'recurrence' => 'daily']);
        self::assertResponseIsSuccessful();
        self::assertSame('Water the garden', $this->body()['title']);
        self::assertSame('daily', $this->body()['recurrence']);

        $this->client->request('GET', '/api/tasks/'.$taskId);
        self::assertSame('Water the plants', $this->body()['title']);
        self::assertSame('weekly', $this->body()['recurrence']);
        self::assertSame($templateId, $this->body()['templateId']);
    }

    // CA: a template with tasks -> 409 on delete (RN-12)
    public function testDeleteTemplateWithTasksReturns409(): void
    {
        $templateId = $this->createTemplate(['title' => 'Water the plants']);
        $this->createTaskFromTemplate($templateId);

        $this->client->request('DELETE', '/api/task-templates/'.$templateId);

        self::assertResponseStatusCodeSame(409);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
    }

    // CA: tasks in the trash count too (RN-12, RN-13)
    public function testDeleteTemplateWhoseTasksAreInTheTrashReturns409(): void
    {
        $templateId = $this->createTemplate(['title' => 'Water the plants']);
        $taskId = $this->createTaskFromTemplate($templateId);
        $this->client->request('DELETE', '/api/tasks/'.$taskId);
        self::assertResponseStatusCodeSame(204);

        $this->client->request('DELETE', '/api/task-templates/'.$templateId);

        self::assertResponseStatusCodeSame(409);
    }

    // CA: a template without tasks -> 204 and deleted for good
    public function testDeleteTemplateWithoutTasksReturns204(): void
    {
        $templateId = $this->createTemplate(['title' => 'Water the plants']);

        $this->client->request('DELETE', '/api/task-templates/'.$templateId);

        self::assertResponseStatusCodeSame(204);
        $this->client->request('GET', '/api/task-templates/'.$templateId);
        self::assertResponseStatusCodeSame(404);
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function createTemplate(array $payload): int
    {
        $this->client->jsonRequest('POST', '/api/task-templates', $payload);
        self::assertResponseStatusCodeSame(201);

        return $this->body()['id'];
    }

    private function createTaskFromTemplate(int $templateId): int
    {
        $this->client->request('POST', '/api/task-templates/'.$templateId.'/instantiate');
        self::assertResponseStatusCodeSame(201);

        return $this->body()['id'];
    }

    /**
     * @return array<mixed>
     */
    private function body(): array
    {
        return json_decode((string) $this->client->getResponse()->getContent(), true, flags: \JSON_THROW_ON_ERROR);
    }

    // CA #9: instantiate -> 201 with a pending task, the template's values and templateId (RN-08)
    public function testInstantiateReturns201WithATaskLinkedToTheTemplate(): void
    {
        $templateId = $this->createTemplate(['title' => 'Buy bread']);

        $this->client->request('POST', '/api/task-templates/'.$templateId.'/instantiate');

        self::assertResponseStatusCodeSame(201);
        $task = $this->body();
        self::assertResponseHeaderSame('Location', '/api/tasks/'.$task['id']);
        self::assertSame('Buy bread', $task['title']);
        self::assertFalse($task['completed']);
        self::assertSame('2026-11-25T10:00:00+00:00', $task['createdAt']);
        self::assertNull($task['recurrence']);
        self::assertNull($task['nextOccurrenceDate']);
        self::assertSame($templateId, $task['templateId']);

        $this->client->request('GET', '/api/tasks');
        self::assertSame([$task['id']], array_column($this->body(), 'id'));
    }

    // CA #9: recurring template -> nextOccurrenceDate = today + recurrence (RN-18)
    public function testInstantiateRecurringTemplateSetsTheNextOccurrenceDate(): void
    {
        $templateId = $this->createTemplate(['title' => 'Water the plants', 'recurrence' => 'weekly']);

        $this->client->request('POST', '/api/task-templates/'.$templateId.'/instantiate');

        self::assertResponseStatusCodeSame(201);
        self::assertSame('weekly', $this->body()['recurrence']);
        self::assertSame('2026-12-02', $this->body()['nextOccurrenceDate']);
    }

    // CA #9: unknown template -> 404
    public function testInstantiateUnknownTemplateReturns404(): void
    {
        $this->client->request('POST', '/api/task-templates/999999/instantiate');

        self::assertResponseStatusCodeSame(404);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
    }
}
