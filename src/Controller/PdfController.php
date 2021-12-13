<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Entity\Personne;
use App\Entity\Ticket;
use Doctrine\ORM\EntityManagerInterface;
use Knp\Snappy\Pdf;
use stdClass;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;

class PdfController extends AbstractController
{
    /**
     * @var Knp\Snappy\Pdf
     */
    private $knpPdf;

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var TicketController
     */
    private $ticketController;

    public function __construct(EntityManagerInterface $em, Pdf $knpPdf, TicketController $ticketController)
    {
        $this->em = $em;
        $this->knpPdf = $knpPdf;
        $this->ticketController = $ticketController;
    }

    /**
     * @Route("/pdf/ticket/{id}", name="pdf_view")
     */
    public function index($id)/*: RedirectResponse */
    {
        $personne = $this->em->getRepository(Personne::class)->find($id);

        $uniqId = uniqid();
        $filename = "ticket$uniqId.pdf";
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public' . $this->getParameter('upload_directory');

        $events = $this->em->getRepository(Evenement::class)->findAll();
        $event = $events[0];

        if ($event->getImageTicket() !== null) {
            $imageTicketPath = $_SERVER['SYMFONY_DEFAULT_ROUTE_URL'] . "uploads/" . $event->getImageTicket()->filePath;
            $ticket = $this->ticketController->create($filename, $personne);

            $this->knpPdf->generateFromHtml(
                $this->renderView(
                    'pdf/ticket.html.twig',
                    [
                        'numero_ticket' => $ticket->getNumero(),
                        'prenom' => $personne->getPrenom(),
                        'nom' => $personne->getNom(),
                        'rue' => $personne->getAdresse(),
                        'code_postal' => $personne->getCodePostal(),
                        'ville' => $personne->getVille(),
                        'image_ticket_path' => $imageTicketPath,
                    ]
                ),
                $uploadDir . "/" . $filename
            );

            return $this->redirectToRoute('home');
        } else {
            return 'error';
        }

        // return $this->render('pdf/ticket.html.twig', [
        //     'numero_ticket' => $ticket->getNumero(),
        //     'prenom' => $personne->getPrenom(),
        //     'nom' => $personne->getNom(),
        //     'rue' => $personne->getAdresse(),
        //     'code_postal' => $personne->getCodePostal(),
        //     'ville' => $personne->getVille(),
        //     'image_ticket_path' => $imageTicketPath,
        // ]);
    }
}
