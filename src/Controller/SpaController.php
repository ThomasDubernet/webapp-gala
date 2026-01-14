<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Controller that serves the React SPA.
 * All routes under this controller return the same SPA template,
 * and React Router handles the routing on the client side.
 */
class SpaController extends AbstractController
{
    /**
     * Serve the React SPA for all authenticated routes.
     * The {path} parameter catches all paths, so React Router can handle them.
     */
    #[Route('/{path}', name: 'spa', requirements: ['path' => '^(?!api|login|logout|_).*'], priority: -100)]
    public function index(): Response
    {
        return $this->render('spa/index.html.twig');
    }
}
