<?php

namespace App\Controller\Api;

use App\Controller\MediaObjectController;
use App\Entity\Evenement;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class EvenementApiController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly MediaObjectController $mediaObjectController
    ) {}

    #[Route('/evenements/{id}/plan', name: 'api_evenement_upload_plan', methods: ['POST'])]
    public function uploadPlan(Request $request, int $id): JsonResponse
    {
        $event = $this->em->getRepository(Evenement::class)->find($id);

        if (!$event) {
            return new JsonResponse(['error' => 'Événement non trouvé'], 404);
        }

        $uploadedFile = $request->files->get('file');

        if (!$uploadedFile instanceof UploadedFile) {
            return new JsonResponse(['error' => 'Fichier requis'], 400);
        }

        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($uploadedFile->getMimeType(), $allowedTypes)) {
            return new JsonResponse(['error' => 'Type de fichier non autorisé. Utilisez JPEG, PNG, GIF ou WebP.'], 400);
        }

        // Remove old plan if exists
        $oldPlan = $event->getPlan();

        // Create new media object
        $plan = $this->mediaObjectController->create($uploadedFile);
        $event->setPlan($plan);

        if ($oldPlan !== null) {
            $this->em->remove($oldPlan);
        }

        $this->em->persist($event);
        $this->em->flush();

        return new JsonResponse([
            'success' => true,
            'plan' => [
                'id' => $plan->getId(),
                'filePath' => $plan->filePath,
                'contentUrl' => '/uploads/media/' . $plan->filePath,
            ]
        ]);
    }
}
