<?php

namespace App\Controller;

use App\Repository\PersonneRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class PersonneSearchController extends AbstractController
{
    public function __construct(
        private PersonneRepository $personneRepository,
        private SerializerInterface $serializer
    ) {
    }

    /**
     * Endpoint de recherche de personnes avec filtrage multi-champs.
     * La recherche est insensible à la casse et aux accents.
     *
     * @param Request $request
     * @return JsonResponse
     *
     * Query parameters:
     * - q: string - Terme de recherche (recherche sur nom, prénom, email, téléphone, ville)
     * - unassigned: bool - Si "true", retourne uniquement les personnes sans table
     * - page: int - Numéro de page (défaut: 1)
     * - limit: int - Nombre d'éléments par page (défaut: 50, max: 100)
     */
    #[Route('/api/personnes/search', name: 'api_personne_search', methods: ['GET'], priority: 1)]
    public function search(Request $request): JsonResponse
    {
        $query = $request->query->get('q', '');
        $unassignedOnly = $request->query->get('unassigned') === 'true';
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(1, (int) $request->query->get('limit', 50)));

        $result = $this->personneRepository->search($query, $unassignedOnly, $page, $limit);

        // Sérialiser les entités avec les groupes de sérialisation
        $itemsJson = $this->serializer->serialize($result['items'], 'json', [
            'groups' => ['personne', 'admin'],
        ]);

        return new JsonResponse([
            'items' => json_decode($itemsJson, true),
            'total' => $result['total'],
            'page' => $result['page'],
            'limit' => $result['limit'],
            'pages' => $result['pages'],
        ]);
    }
}
