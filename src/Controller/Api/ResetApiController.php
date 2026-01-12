<?php

namespace App\Controller\Api;

use App\Entity\Evenement;
use App\Entity\MediaObject;
use App\Entity\Personne;
use App\Entity\Table;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/reset')]
class ResetApiController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {}

    /**
     * Reset simple: delete all personnes and tables, keep the plan
     */
    #[Route('/simple', name: 'api_reset_simple', methods: ['POST'])]
    public function resetSimple(): JsonResponse
    {
        try {
            $this->cleanDatabase();
            return new JsonResponse(['success' => true, 'message' => 'Réinitialisation simple effectuée']);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Reset all: delete everything including plan and event config
     */
    #[Route('/all', name: 'api_reset_all', methods: ['POST'])]
    public function resetAll(): JsonResponse
    {
        try {
            $events = $this->em->getRepository(Evenement::class)->findAll();
            $medias = $this->em->getRepository(MediaObject::class)->findAll();
            $fs = new Filesystem();
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public' . $this->getParameter('upload_directory');

            $this->em->beginTransaction();

            foreach ($events as $event) {
                if ($event->getPlan() !== null) {
                    $planPath = $event->getPlan()->filePath;
                    $event
                        ->setPlan(null)
                        ->setBilletwebId(null)
                        ->setLastUpdateBilletWeb(null);

                    $fs->remove($uploadDir . "/" . $planPath);
                    $this->em->persist($event);
                    $this->em->flush();
                }
                $this->em->remove($event);
                $this->em->flush();
            }

            foreach ($medias as $media) {
                $this->em->remove($media);
            }

            $newEvent = new Evenement();
            $this->em->persist($newEvent);
            $this->em->flush();
            $this->em->commit();

            $this->cleanDatabase();

            return new JsonResponse(['success' => true, 'message' => 'Réinitialisation complète effectuée']);
        } catch (\Exception $e) {
            $this->em->rollback();
            return new JsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete only personnes without a table assigned
     */
    #[Route('/personnes-without-table', name: 'api_reset_personnes_without_table', methods: ['POST'])]
    public function resetPersonnesWithoutTable(): JsonResponse
    {
        try {
            $personnes = $this->em->getRepository(Personne::class)->findBy(['table' => null]);
            $count = count($personnes);

            foreach ($personnes as $personne) {
                $conjoint = $personne->getConjoint();
                $primary = $this->em->getRepository(Personne::class)->findOneBy(['conjoint' => $personne->getId()]);

                if ($conjoint instanceof Personne) {
                    $conjoint->setConjoint(null);
                    $this->em->persist($conjoint);
                }

                if ($primary instanceof Personne) {
                    $primary->setConjoint(null);
                    $this->em->persist($primary);
                }

                $personne->setConjoint(null);
                $this->em->persist($personne);
                $this->em->flush();

                $this->em->remove($personne);
            }
            $this->em->flush();

            return new JsonResponse([
                'success' => true,
                'message' => "Suppression de {$count} personne(s) sans table effectuée"
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    private function cleanDatabase(): void
    {
        $personnes = $this->em->getRepository(Personne::class)->findAll();
        $tables = $this->em->getRepository(Table::class)->findAll();

        $this->em->beginTransaction();

        $events = $this->em->getRepository(Evenement::class)->findAll();

        foreach ($events as $event) {
            $event->setLastUpdateBilletWeb(null);
            $this->em->persist($event);
        }

        foreach ($personnes as $personne) {
            if ($personne->getConjoint() !== null) {
                $conjoint = $personne->getConjoint();
                $conjoint->setConjoint(null);
                $personne->setConjoint(null);
                $this->em->persist($personne);
                $this->em->persist($conjoint);
                $this->em->flush();
            }
            $this->em->remove($personne);
        }

        foreach ($tables as $table) {
            $this->em->remove($table);
        }

        $this->em->flush();
        $this->em->commit();
    }
}
