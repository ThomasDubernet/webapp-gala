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
     * @var EventController
     */
    private $eventController;

    public function __construct(EntityManagerInterface $em, EventController $eventController)
    {
        $this->em = $em;
        $this->eventController = $eventController;
    }

    /**
     * @Route("/", name="home")
     */
    public function index(): Response
    {
        if ($this->eventController->verification()) {
            return $this->render('home/index.html.twig', []);
        } else {
            return $this->redirectToRoute('event_edit');
        }
    }
}
