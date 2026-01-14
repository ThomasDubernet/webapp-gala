<?php

namespace App\Controller;

use App\Entity\Personne;
use App\Entity\Table;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class PersonneTableController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {}

    #[Route('/personne/{personneId}/add_table/{tableId}', name: 'personne_add_table', methods: ['POST'])]
    public function addTable(int $personneId, int $tableId): JsonResponse
    {
        $personne = $this->em->getRepository(Personne::class)->find($personneId);

        if (!$personne) {
            return new JsonResponse([
                'success' => false,
                'error' => 'Personne non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        $table = $this->em->getRepository(Table::class)->find($tableId);

        if (!$table) {
            return new JsonResponse([
                'success' => false,
                'error' => 'Table non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        // Check if the table is full
        if (count($table->getPersonnes()) >= $table->getNombrePlacesMax()) {
            return new JsonResponse([
                'success' => false,
                'error' => 'La table est pleine'
            ], Response::HTTP_BAD_REQUEST);
        }

        $personne->setTable($table);
        $this->em->flush();

        return new JsonResponse([
            'success' => true,
            'message' => sprintf('%s %s a été ajouté(e) à la table %s',
                $personne->getPrenom(),
                $personne->getNom(),
                $table->getNom()
            )
        ]);
    }

    #[Route('/personne/{personneId}/remove_table', name: 'personne_remove_table', methods: ['POST'])]
    public function removeTable(int $personneId): JsonResponse
    {
        $personne = $this->em->getRepository(Personne::class)->find($personneId);

        if (!$personne) {
            return new JsonResponse([
                'success' => false,
                'error' => 'Personne non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        $personne->setTable(null);
        $this->em->flush();

        return new JsonResponse([
            'success' => true,
            'message' => sprintf('%s %s a été retiré(e) de la table',
                $personne->getPrenom(),
                $personne->getNom()
            )
        ]);
    }
}
