<?php

declare(strict_types=1);

namespace App\Tests\Functional\Controller;

use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Acceptance criteria of issue #15 on /api/categories (F-15 to F-18, RN-14, RN-16, RN-17).
 */
final class CategoryControllerTest extends WebTestCase
{
    private KernelBrowser $client;

    protected function setUp(): void
    {
        $this->client = self::createClient();
    }

    // CA #15-1: valid name -> 201 with the category and Location (F-16)
    public function testCreateReturns201WithLocation(): void
    {
        $this->client->jsonRequest('POST', '/api/categories', ['name' => '  Home  ']);

        self::assertResponseStatusCodeSame(201);
        $category = $this->body();
        self::assertResponseHeaderSame('Location', '/api/categories/'.$category['id']);
        self::assertSame(['id' => $category['id'], 'name' => 'Home'], $category);
    }

    // CA #15-2: blank name on create -> 422 in problem+json (RN-14)
    public function testCreateWithBlankNameReturns422(): void
    {
        $this->client->jsonRequest('POST', '/api/categories', ['name' => '   ']);

        $this->assertViolationOn('name');
    }

    // CA #15-2: blank name on rename -> 422 (RN-14)
    public function testRenameWithBlankNameReturns422(): void
    {
        $id = $this->createCategory('Home');

        $this->client->jsonRequest('PUT', '/api/categories/'.$id, ['name' => '']);

        $this->assertViolationOn('name');
    }

    // CA #15-3: "Casa" exists, creating " casa " -> 422 on name (RN-17)
    public function testCreateDuplicateNameReturns422(): void
    {
        $this->createCategory('Casa');

        $this->client->jsonRequest('POST', '/api/categories', ['name' => ' casa ']);

        $this->assertViolationOn('name');
        $this->client->request('GET', '/api/categories');
        self::assertCount(1, $this->body());
    }

    // CA #15-3: renaming another category as " casa " -> 422 on name (RN-17)
    public function testRenameToExistingNameReturns422(): void
    {
        $this->createCategory('Casa');
        $id = $this->createCategory('Trabajo');

        $this->client->jsonRequest('PUT', '/api/categories/'.$id, ['name' => ' casa ']);

        $this->assertViolationOn('name');
    }

    // CA #15-4: renaming a category with its own name -> 200 (F-17, RN-17)
    public function testRenameWithOwnNameReturns200(): void
    {
        $id = $this->createCategory('Casa');

        $this->client->jsonRequest('PUT', '/api/categories/'.$id, ['name' => 'CASA']);

        self::assertResponseIsSuccessful();
        self::assertSame(['id' => $id, 'name' => 'CASA'], $this->body());
    }

    // CA #15-5: GET returns all the categories, by id (F-15)
    public function testListReturnsAllCategories(): void
    {
        $first = $this->createCategory('Work');
        $second = $this->createCategory('Home');

        $this->client->request('GET', '/api/categories');

        self::assertResponseIsSuccessful();
        self::assertSame([
            ['id' => $first, 'name' => 'Work'],
            ['id' => $second, 'name' => 'Home'],
        ], $this->body());
    }

    // CA #15-8: a category with an active task -> 409 in problem+json (RN-16)
    public function testDeleteCategoryWithTasksReturns409(): void
    {
        $id = $this->createCategory('Home');
        $this->createTask($id);

        $this->client->request('DELETE', '/api/categories/'.$id);

        self::assertResponseStatusCodeSame(409);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
    }

    // CA #15-8: a task in the trash also blocks the delete (RN-16)
    public function testDeleteCategoryWithTaskInTrashReturns409(): void
    {
        $id = $this->createCategory('Home');
        $taskId = $this->createTask($id);
        $this->client->request('DELETE', '/api/tasks/'.$taskId);
        self::assertResponseStatusCodeSame(204);

        $this->client->request('DELETE', '/api/categories/'.$id);

        self::assertResponseStatusCodeSame(409);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
    }

    // CA #15-9: a category without tasks -> 204 and it is deleted for good (F-18)
    public function testDeleteCategoryWithoutTasksReturns204AndRemovesIt(): void
    {
        $id = $this->createCategory('Home');

        $this->client->request('DELETE', '/api/categories/'.$id);

        self::assertResponseStatusCodeSame(204);
        self::assertSame('', (string) $this->client->getResponse()->getContent());
        $this->client->request('GET', '/api/categories');
        self::assertSame([], $this->body());
    }

    // Unknown id -> 404 in problem+json for PUT and DELETE (docs/analisis.md §4)
    public function testUnknownIdReturns404ForRenameAndDelete(): void
    {
        $this->client->jsonRequest('PUT', '/api/categories/999999', ['name' => 'Home']);
        self::assertResponseStatusCodeSame(404);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');

        $this->client->request('DELETE', '/api/categories/999999');
        self::assertResponseStatusCodeSame(404);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
    }

    private function assertViolationOn(string $field): void
    {
        self::assertResponseStatusCodeSame(422);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
        $problem = $this->body();
        self::assertSame(422, $problem['status']);
        self::assertSame($field, $problem['violations'][0]['propertyPath']);
    }

    private function createCategory(string $name): int
    {
        $this->client->jsonRequest('POST', '/api/categories', ['name' => $name]);
        self::assertResponseStatusCodeSame(201);

        return $this->body()['id'];
    }

    private function createTask(int $categoryId): int
    {
        $this->client->jsonRequest('POST', '/api/tasks', ['title' => 'Buy bread', 'categoryId' => $categoryId]);
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
}
