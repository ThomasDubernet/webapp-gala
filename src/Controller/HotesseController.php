<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/hotesse")
 */
class HotesseController extends AbstractController
{
    /**
     * @Route("/", name="dahsboard_hotesse")
     */
    public function index()
    {
        return $this->render('home/index_hotesse.html.twig', [
            'hotesse' => true
        ]);
    }

}