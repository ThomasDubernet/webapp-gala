<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/hotesse')]
class HotesseController extends AbstractController
{
    #[Route('/', name: 'dahsboard_hotesse')]
    public function index(): Response
    {
        return $this->render('home/index_hotesse.html.twig', [
            'hotesse' => true
        ]);
    }
}
