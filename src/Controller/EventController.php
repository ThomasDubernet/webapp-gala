<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Form\EventType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * @Route("/evenement")
 */
class EventController extends AbstractController
{
    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var MediaObjectController
     */
    private $mediaObjectController;

    public function __construct(EntityManagerInterface $em, MediaObjectController $mediaObjectController)
    {
        $this->em = $em;
        $this->mediaObjectController = $mediaObjectController;
    }

    /**
     * @Route("/{id}/edit", name="event_edit")
     */
    public function edit($id, Request $request): Response
    {
        $event = $this->em->getRepository(Evenement::class)->find($id);

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

        return $this->renderForm('event/edit.html.twig', [
            'event' => $event,
            'form' => $form
        ]);
    }
}
