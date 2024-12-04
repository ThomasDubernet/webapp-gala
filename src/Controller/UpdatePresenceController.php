<?php

namespace App\Controller;

use App\Entity\Personne;
use App\Service\SmsService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdatePresenceController extends AbstractController
{
    private $em;
    private $smsService;
    public function __construct(EntityManagerInterface $em, SmsService $smsService)
    {
        $this->em = $em;
        $this->smsService = $smsService;
    }

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
        } else {
            $personne->setPresent($content['present']);
            $this->em->persist($personne);
            $this->em->flush();

            if ($personne->getSmsSended() !== true) {
                $this->smsService->sendSms($personne);
            }

            return new JsonResponse($personne);
        }
    }
}