<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
{
    /**
     * @var EventController
     */
    private $eventController;

    public function __construct(EventController $eventController)
    {
        $this->eventController = $eventController;
    }

    /**
     * @Route("/", name="home")
     */
    public function index(Request $request): Response
    {
        if ($this->eventController->verification()) {
            return $this->render('home/index.html.twig');
        } else {
            return $this->redirectToRoute('event_edit');
        }
    }
}
