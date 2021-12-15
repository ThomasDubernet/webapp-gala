<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Entity\Personne;
use App\Entity\Table;
use App\Entity\Ticket;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Sasedev\MpdfBundle\Factory\MpdfFactory;

class PdfController extends AbstractController
{
    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var TicketController
     */
    private $ticketController;

    /**
     * @var MpdfFactory
     */
    private $MpdfFactory;

    public function __construct(
        EntityManagerInterface $em,
        TicketController $ticketController,
        MpdfFactory $MpdfFactory
    )
    {
        $this->em = $em;
        $this->MpdfFactory = $MpdfFactory;
        $this->ticketController = $ticketController;
    }

    /**
     * @Route("/pdf/ticket/{id}", name="pdf_creation_ticket")
     */
    public function createTicket($id)
    {
        $personne = $this->em->getRepository(Personne::class)->find($id);
        $mPdf = $this->MpdfFactory->createMpdfObject([
            'mode' => 'utf-8',
            'format' => 'A4',
            'margin_header' => 5,
            'margin_footer' => 5,
            'orientation' => 'P'
        ]);

        $uniqId = uniqid();
        $filename = "ticket$uniqId.pdf";
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public' . $this->getParameter('upload_directory');

        $events = $this->em->getRepository(Evenement::class)->findAll();
        $event = $events[0];

        if ($event->getImageTicket() !== null) {
            $imageTicketPath = $uploadDir . "/" . $event->getImageTicket()->filePath;
            $ticket = $this->ticketController->create($filename, $personne);

            $stylesheet = file_get_contents($this->getParameter('kernel.project_dir') . '/public/pdf_ticket.css');
            $mPdf->WriteHtml($stylesheet, 1);
            $mPdf->WriteHtml($this->renderView('pdf/ticket.html.twig', [
                'numero_ticket' => $ticket->getNumero(),
                'prenom' => $personne->getPrenom(),
                'nom' => $personne->getNom(),
                'rue' => $personne->getAdresse(),
                'code_postal' => $personne->getCodePostal(),
                'ville' => $personne->getVille(),
                'image_ticket_path' => $imageTicketPath,
            ]));
            $mPdf->Output($uploadDir . '/' . $filename, 'F');

            return $this->redirectToRoute('home');
        } else {
            return 'error';
        }
    }

    /**
     * @Route("/table/{id}/pdf", name="pdf_creation_list")
     */
    public function createListPersonneOfTable(Table $table)
    {
        $personnes = $table->getPersonnes();
        $mPdf = $this->MpdfFactory->createMpdfObject([
            'mode' => 'utf-8',
            'format' => 'A4',
            'margin_header' => 5,
            'margin_footer' => 5,
            'orientation' => 'P'
        ]);

        $stylesheet = file_get_contents($this->getParameter('kernel.project_dir') . '/public/pdf_list_personne.css');
        $mPdf->WriteHtml($stylesheet, 1);
        $mPdf->WriteHtml($this->renderView('pdf/list_personne.html.twig', [
            'personnes' => $personnes,
            'table' => $table
        ]));
        $mPdf->Output('list_personne.pdf', 'I');
    }
}
