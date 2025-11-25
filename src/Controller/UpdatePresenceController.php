<?php

namespace App\Controller;

use App\Entity\Personne;
use App\Service\SmsService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\SerializerInterface;

class UpdatePresenceController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly SmsService $smsService,
        private readonly SerializerInterface $serializer
    ) {}

    public function __invoke(Request $request): Response
    {
        /** @var Personne $personne */
        $personne = $request->get('data');
        $content = json_decode($request->getContent(), true);

        if (!isset($content['present']) || !is_bool($content['present'])) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Invalid params'
            ], Response::HTTP_BAD_REQUEST);
        }

        $personne->setPresent($content['present']);
        $this->em->persist($personne);
        $this->em->flush();

        $forceSms = $content['withSms'] === true && $content['present'] === true;

        if ($personne->getSmsSended() !== true || $forceSms) {
            $this->smsService->sendSms($personne);
        }

        $serializedPersonne = $this->serializer->serialize($personne, 'json');

        return new JsonResponse(json_decode($serializedPersonne));
    }
}
