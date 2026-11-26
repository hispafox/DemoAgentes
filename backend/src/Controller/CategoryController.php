<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\CategoryInput;
use App\Dto\CategoryOutput;
use App\Service\CategoryService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

/**
 * HTTP layer for /api/categories (docs/analisis.md §4, version 0.2, issue #15).
 *
 * There is no detail endpoint in the analysis: the Location header of POST
 * points to /api/categories/{id}, the URL used by PUT and DELETE.
 */
// format: 'json' makes errors render as JSON even without an Accept header;
// for /api requests that match no route, see ApiJsonFormatSubscriber.
#[Route('/api/categories', name: 'api_categories_', format: 'json')]
final class CategoryController extends AbstractController
{
    public function __construct(
        private readonly CategoryService $categoryService,
    ) {
    }

    // F-15: list categories
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return $this->json(array_map(CategoryOutput::fromEntity(...), $this->categoryService->list()));
    }

    // F-16: create a category (RN-14, RN-17)
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(#[MapRequestPayload] CategoryInput $input): JsonResponse
    {
        $category = $this->categoryService->create($input);

        return $this->json(
            CategoryOutput::fromEntity($category),
            JsonResponse::HTTP_CREATED,
            ['Location' => $this->generateUrl('api_categories_update', ['id' => $category->getId()])],
        );
    }

    // F-17: rename a category (RN-14, RN-17)
    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, #[MapRequestPayload] CategoryInput $input): JsonResponse
    {
        $category = $this->categoryService->rename($this->categoryService->getCategory($id), $input);

        return $this->json(CategoryOutput::fromEntity($category));
    }

    // F-18: delete a category for good, only without tasks (RN-16)
    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): Response
    {
        $this->categoryService->delete($this->categoryService->getCategory($id));

        return new Response(null, Response::HTTP_NO_CONTENT);
    }
}
