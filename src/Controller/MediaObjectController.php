<?php

namespace App\Controller;

use App\Entity\MediaObject;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

final class MediaObjectController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {}

    public function __invoke(Request $request): MediaObject
    {
        $uploadedFile = $request->files->get('file');
        if (!$uploadedFile) {
            throw new BadRequestHttpException('"file" is required');
        }

        $mediaObject = new MediaObject();
        $mediaObject->file = $uploadedFile;

        return $mediaObject;
    }

    public function create($uploadedFile): MediaObject
    {
        $mediaObject = new MediaObject();
        $mediaObject->file = $uploadedFile;

        $this->em->persist($mediaObject);
        $this->em->flush();

        return $mediaObject;
    }
}
