<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class HomeController extends AbstractController
{
    public function __construct(
        private readonly EventController $eventController
    ) {}

    #[Route('/', name: 'home')]
    public function index(Request $request): Response
    {
        if ($this->eventController->verification()) {
            return $this->render('home/index.html.twig');
        }

        return $this->redirectToRoute('event_edit');
    }
}
