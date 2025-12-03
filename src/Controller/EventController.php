<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Form\EventType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/evenement')]
class EventController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly MediaObjectController $mediaObjectController
    ) {}

    #[Route('/edit', name: 'event_edit')]
    public function edit(Request $request): Response
    {
        $allEvents = $this->em->getRepository(Evenement::class)->findAll();

        $event = count($allEvents) > 0 ? $allEvents[0] : new Evenement();

        $form = $this->createForm(EventType::class, $event);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $eventFiles = $request->files->get('event');
            if (isset($eventFiles)) {
                if (isset($eventFiles['planFile']) && $eventFiles['planFile'] instanceof UploadedFile) {
                    $oldPlan = $event->getPlan();
                    $plan = $this->mediaObjectController->create($eventFiles['planFile']);
                    $event->setPlan($plan);
                    if ($oldPlan !== null) {
                        $this->em->remove($oldPlan);
                    }
                }
                if (isset($eventFiles['imageTicketFile']) && $eventFiles['imageTicketFile'] instanceof UploadedFile) {
                    $oldImageTicket = $event->getImageTicket();
                    $imageTicket = $this->mediaObjectController->create($eventFiles['imageTicketFile']);
                    $event->setImageTicket($imageTicket);
                    if ($oldImageTicket !== null) {
                        $this->em->remove($oldImageTicket);
                    }
                }
            }
            $this->em->persist($event);
            $this->em->flush();

            return $this->redirectToRoute('home', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('event/edit.html.twig', [
            'event' => $event,
            'form' => $form
        ]);
    }

    public function verification(): bool
    {
        $allEvents = $this->em->getRepository(Evenement::class)->findAll();

        if ($allEvents[0] instanceof Evenement) {
            $event = $allEvents[0];
            $infosToVerify = [
                "Nom",
                "NomSalle",
                "Date",
                "Adresse",
                "CodePostal",
                "Ville",
                "Plan",
                "ImageTicket",
                "TextEmail"
            ];

            foreach ($infosToVerify as $value) {
                if (method_exists(Evenement::class, "get" . $value)) {
                    if (!$event->{"get" . $value}() || $event->{"get" . $value}() == null) {
                        return false;
                    }
                }
            }
            return true;
        }

        return false;
    }
}
