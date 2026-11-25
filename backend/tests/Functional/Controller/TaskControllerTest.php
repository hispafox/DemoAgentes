<?php

declare(strict_types=1);

namespace App\Tests\Functional\Controller;

use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Clock\Test\ClockSensitiveTrait;

/**
 * Acceptance criteria of issue #5 on /api/tasks (F-01 to F-04).
 */
final class TaskControllerTest extends WebTestCase
{
    use ClockSensitiveTrait;

    private KernelBrowser $client;

    protected function setUp(): void
    {
        self::mockTime('2026-11-25 10:00:00');
        $this->client = self::createClient();
    }

    // CA: valid title -> 201, Location and a pending task with createdAt (RN-02)
    public function testCreateReturns201WithLocationAndAPendingTask(): void
    {
        $this->client->jsonRequest('POST', '/api/tasks', ['title' => 'Buy bread']);

        self::assertResponseStatusCodeSame(201);
        $task = $this->body();
        self::assertResponseHeaderSame('Location', '/api/tasks/'.$task['id']);
        self::assertSame('Buy bread', $task['title']);
        self::assertFalse($task['completed']);
        self::assertSame('2026-11-25T10:00:00+00:00', $task['createdAt']);
        self::assertNull($task['recurrence']);
        self::assertNull($task['nextOccurrenceDate']);
    }

    // RN-18: a recurring task is created with today + recurrence
    public function testCreateRecurringTaskSetsTheNextOccurrenceDate(): void
    {
        $this->client->jsonRequest('POST', '/api/tasks', ['title' => 'Water the plants', 'recurrence' => 'weekly']);

        self::assertResponseStatusCodeSame(201);
        self::assertSame('weekly', $this->body()['recurrence']);
        self::assertSame('2026-12-02', $this->body()['nextOccurrenceDate']);
    }

    // CA: blank title -> 422 in problem+json (RN-01)
    public function testCreateWithBlankTitleReturns422ProblemDetails(): void
    {
        $this->client->jsonRequest('POST', '/api/tasks', ['title' => '   ']);

        self::assertResponseStatusCodeSame(422);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
        $problem = $this->body();
        self::assertSame(422, $problem['status']);
        self::assertSame('title', $problem['violations'][0]['propertyPath']);
    }

    // CA: unknown recurrence on create -> 422 (RN-04)
    public function testCreateWithUnknownRecurrenceReturns422(): void
    {
        $this->client->jsonRequest('POST', '/api/tasks', ['title' => 'Pay rent', 'recurrence' => 'yearly']);

        self::assertResponseStatusCodeSame(422);
        self::assertSame('recurrence', $this->body()['violations'][0]['propertyPath']);
    }

    // CA: unknown recurrence on update -> 422 (RN-04)
    public function testUpdateWithUnknownRecurrenceReturns422(): void
    {
        $id = $this->createTask(['title' => 'Pay rent']);

        $this->client->jsonRequest('PUT', '/api/tasks/'.$id, ['title' => 'Pay rent', 'recurrence' => 'yearly']);

        self::assertResponseStatusCodeSame(422);
    }

    // Malformed JSON -> 400
    public function testCreateWithMalformedJsonReturns400(): void
    {
        $this->client->request('POST', '/api/tasks', server: ['CONTENT_TYPE' => 'application/json'], content: '{"title":');

        self::assertResponseStatusCodeSame(400);
    }

    // CA: several tasks -> GET returns them all (F-01)
    public function testListReturnsAllTasks(): void
    {
        $first = $this->createTask(['title' => 'Buy bread']);
        $second = $this->createTask(['title' => 'Water the plants', 'recurrence' => 'daily']);

        $this->client->request('GET', '/api/tasks');

        self::assertResponseIsSuccessful();
        self::assertSame([$first, $second], array_column($this->body(), 'id'));
    }

    // F-02
    public function testShowReturnsTheTask(): void
    {
        $id = $this->createTask(['title' => 'Buy bread']);

        $this->client->request('GET', '/api/tasks/'.$id);

        self::assertResponseIsSuccessful();
        self::assertSame('Buy bread', $this->body()['title']);
    }

    // CA: unknown id on GET -> 404 in problem+json
    public function testShowUnknownTaskReturns404ProblemDetails(): void
    {
        $this->client->request('GET', '/api/tasks/999999');

        self::assertResponseStatusCodeSame(404);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
        self::assertSame(404, $this->body()['status']);
    }

    // CA: unknown id on PUT -> 404
    public function testUpdateUnknownTaskReturns404(): void
    {
        $this->client->jsonRequest('PUT', '/api/tasks/999999', ['title' => 'Buy bread']);

        self::assertResponseStatusCodeSame(404);
    }

    // CA: PUT updates title and recurrence; the status cannot be changed (RN-11, RN-18)
    public function testUpdateChangesTitleAndRecurrenceButNotStatus(): void
    {
        $id = $this->createTask(['title' => 'Water the plants']);

        $this->client->jsonRequest('PUT', '/api/tasks/'.$id, [
            'title' => 'Water all the plants',
            'recurrence' => 'monthly',
            'completed' => true,
        ]);

        self::assertResponseIsSuccessful();
        $task = $this->body();
        self::assertSame('Water all the plants', $task['title']);
        self::assertSame('monthly', $task['recurrence']);
        self::assertSame('2026-12-25', $task['nextOccurrenceDate']);
        self::assertFalse($task['completed']);
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function createTask(array $payload): int
    {
        $this->client->jsonRequest('POST', '/api/tasks', $payload);
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

    // CA #6: non-recurring task -> completed and nextOccurrence null (RN-06)
    public function testCompleteNonRecurringTaskReturnsNoNextOccurrence(): void
    {
        $id = $this->createTask(['title' => 'Buy bread']);

        $this->client->request('POST', '/api/tasks/'.$id.'/complete');

        self::assertResponseIsSuccessful();
        self::assertTrue($this->body()['task']['completed']);
        self::assertNull($this->body()['nextOccurrence']);
    }

    // CA #6: weekly task completed today -> new pending task, same title and recurrence, today + 7 days (RN-05)
    public function testCompleteWeeklyTaskCreatesTheNextOccurrence(): void
    {
        $id = $this->createTask(['title' => 'Water the plants', 'recurrence' => 'weekly']);

        $this->client->request('POST', '/api/tasks/'.$id.'/complete');

        self::assertResponseIsSuccessful();
        $next = $this->body()['nextOccurrence'];
        self::assertNotSame($id, $next['id']);
        self::assertSame('Water the plants', $next['title']);
        self::assertSame('weekly', $next['recurrence']);
        self::assertFalse($next['completed']);
        self::assertSame('2026-12-02', $next['nextOccurrenceDate']);

        $this->client->request('GET', '/api/tasks');
        self::assertSame([true, false], array_column($this->body(), 'completed'));
    }

    // CA #6: monthly task completed on 31 January -> last day of February (RN-05)
    public function testCompleteMonthlyTaskOnJanuary31CreatesTheNextOccurrenceOnTheLastDayOfFebruary(): void
    {
        self::mockTime('2027-01-31 18:00:00');
        $id = $this->createTask(['title' => 'Pay rent', 'recurrence' => 'monthly']);

        $this->client->request('POST', '/api/tasks/'.$id.'/complete');

        self::assertResponseIsSuccessful();
        self::assertSame('2027-02-28', $this->body()['nextOccurrence']['nextOccurrenceDate']);
    }

    // CA #6: already completed -> 409 in problem+json (RN-11)
    public function testCompleteAlreadyCompletedTaskReturns409(): void
    {
        $id = $this->createTask(['title' => 'Buy bread']);
        $this->client->request('POST', '/api/tasks/'.$id.'/complete');

        $this->client->request('POST', '/api/tasks/'.$id.'/complete');

        self::assertResponseStatusCodeSame(409);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
        self::assertSame(409, $this->body()['status']);
    }

    // Unknown id -> 404
    public function testCompleteUnknownTaskReturns404(): void
    {
        $this->client->request('POST', '/api/tasks/999999/complete');

        self::assertResponseStatusCodeSame(404);
    }

    // CA #7: DELETE -> 204, gone from the list and present in the trash (RN-10)
    public function testDeleteMovesTheTaskToTheTrash(): void
    {
        $kept = $this->createTask(['title' => 'Buy bread']);
        $deleted = $this->createTask(['title' => 'Water the plants']);

        $this->client->request('DELETE', '/api/tasks/'.$deleted);

        self::assertResponseStatusCodeSame(204);
        self::assertSame('', (string) $this->client->getResponse()->getContent());

        $this->client->request('GET', '/api/tasks');
        self::assertSame([$kept], array_column($this->body(), 'id'));

        $this->client->request('GET', '/api/tasks/trash');
        self::assertResponseIsSuccessful();
        $trash = $this->body();
        self::assertSame([$deleted], array_column($trash, 'id'));
        self::assertSame('2026-11-25T10:00:00+00:00', $trash[0]['deletedAt']);
    }

    // CA #7: a task in the trash answers 404 to GET, PUT, DELETE and complete (RN-13)
    public function testTaskInTheTrashIsNotFoundForOtherActions(): void
    {
        $id = $this->createTask(['title' => 'Water the plants']);
        $this->client->request('DELETE', '/api/tasks/'.$id);

        $this->client->request('GET', '/api/tasks/'.$id);
        self::assertResponseStatusCodeSame(404);

        $this->client->jsonRequest('PUT', '/api/tasks/'.$id, ['title' => 'Water all the plants']);
        self::assertResponseStatusCodeSame(404);

        $this->client->request('DELETE', '/api/tasks/'.$id);
        self::assertResponseStatusCodeSame(404);

        $this->client->request('POST', '/api/tasks/'.$id.'/complete');
        self::assertResponseStatusCodeSame(404);
    }

    // CA #7: restore -> back in the list with the status it had (RN-10)
    public function testRestoreBringsTheTaskBackWithItsStatus(): void
    {
        $id = $this->createTask(['title' => 'Buy bread']);
        $this->client->request('POST', '/api/tasks/'.$id.'/complete');
        $this->client->request('DELETE', '/api/tasks/'.$id);

        $this->client->request('POST', '/api/tasks/'.$id.'/restore');

        self::assertResponseIsSuccessful();
        self::assertTrue($this->body()['completed']);
        self::assertNull($this->body()['deletedAt']);

        $this->client->request('GET', '/api/tasks');
        self::assertSame([$id], array_column($this->body(), 'id'));

        $this->client->request('GET', '/api/tasks/trash');
        self::assertSame([], $this->body());
    }

    // CA #7: restoring an active task -> 409 in problem+json
    public function testRestoreActiveTaskReturns409(): void
    {
        $id = $this->createTask(['title' => 'Buy bread']);

        $this->client->request('POST', '/api/tasks/'.$id.'/restore');

        self::assertResponseStatusCodeSame(409);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
    }

    // Unknown id -> 404
    public function testRestoreUnknownTaskReturns404(): void
    {
        $this->client->request('POST', '/api/tasks/999999/restore');

        self::assertResponseStatusCodeSame(404);
    }
}
