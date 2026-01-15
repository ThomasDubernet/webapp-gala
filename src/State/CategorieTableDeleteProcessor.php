<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\CategorieTable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Processor for CategorieTable deletion.
 * Prevents deletion if tables are assigned to the category.
 */
class CategorieTableDeleteProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
    {
        if (!$data instanceof CategorieTable) {
            return;
        }

        // Check if tables are assigned to this category
        if ($data->getTables()->count() > 0) {
            $count = $data->getTables()->count();
            throw new BadRequestHttpException(
                sprintf(
                    'Impossible de supprimer cette catégorie : %d table(s) y sont assignée(s). Veuillez d\'abord réassigner ces tables à une autre catégorie.',
                    $count
                )
            );
        }

        // Proceed with deletion
        $this->entityManager->remove($data);
        $this->entityManager->flush();
    }
}
