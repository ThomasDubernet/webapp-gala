<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Entity\Personne;
use App\Entity\Table;
use App\Form\EventType;
use App\Form\PersonneType;
use App\Form\TableType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
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
     * @Route("/", name="home")
     */
    public function index(Request $request): Response
    {
        $newEvent = new Evenement();

        $allEvents = $this->em->getRepository(Evenement::class)->findAll();
        $eventForm = $this->createForm(EventType::class, count($allEvents) > 0 ? $allEvents[0] : $newEvent);
        $eventForm->handleRequest($request);
        if ($eventForm->isSubmitted() && $eventForm->isValid()) {
            $plan = $eventForm->get('plan')->getData();
            $imageTicket = $eventForm->get('imageTicket')->getData();

            if ($plan instanceof UploadedFile) {
                $planMedia = $this->mediaObjectController->create($plan);
                $newEvent->setPlan($planMedia);
            }

            if ($imageTicket instanceof UploadedFile) {
                $imageTicketMedia = $this->mediaObjectController->create($imageTicket);
                $newEvent->setImageTicket($imageTicketMedia);
            }

            $this->em->persist($newEvent);
            $this->em->flush();
        }

        $allTables = $this->em->getRepository(Table::class)->findAll();
        $allPersonnes = $this->em->getRepository(Personne::class)->findAll();
        $allEvents = $this->em->getRepository(Evenement::class)->findAll();

        return $this->render('home/index.html.twig', [
            'event_form' => $eventForm->createView(),
            'all_tables' => $allTables,
            'all_personnes' => $allPersonnes,
            'event' => count($allEvents) > 0 ? $allEvents[0] : null,
        ]);
    }
}
