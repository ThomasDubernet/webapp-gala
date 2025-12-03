<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Entity\Personne;
use App\Entity\Table;
use Doctrine\ORM\EntityManagerInterface;
use App\Service\MpdfFactory;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;

class PdfController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly TicketController $ticketController,
        private readonly MpdfFactory $MpdfFactory
    ) {}

    public function createTicket(Personne $personne): void
    {
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
                'civilite' => $personne->getCivilite()->getNom(),
                'prenom' => $personne->getPrenom(),
                'nom' => $personne->getNom(),
                'rue' => $personne->getAdresse(),
                'code_postal' => $personne->getCodePostal(),
                'ville' => $personne->getVille(),
                'image_ticket_path' => $imageTicketPath,
            ]));

            $mPdf->Output($uploadDir . '/' . $filename, 'F');
        }
    }

    public function createMassTickets(array $personnes, Evenement $event, string $uploadDir): void
    {
        for ($i = 0; $i < count($personnes); $i++) {
            $mPdf = $this->MpdfFactory->createMpdfObject([
                'mode' => 'utf-8',
                'format' => 'A4',
                'margin_header' => 5,
                'margin_footer' => 5,
                'orientation' => 'P'
            ]);
            $uniqId = uniqid();
            $filename = "ticket$uniqId.pdf";
            if ($event->getImageTicket() !== null) {
                $imageTicketPath = $uploadDir . "/" . $event->getImageTicket()->filePath;
                $ticket = $this->ticketController->create($filename, $personnes[$i], false);

                $stylesheet = file_get_contents($this->getParameter('kernel.project_dir') . '/public/pdf_ticket.css');
                $mPdf->WriteHtml($stylesheet, 1);
                $mPdf->WriteHtml($this->renderView('pdf/ticket.html.twig', [
                    'numero_ticket' => $ticket->getNumero(),
                    'civilite' => $personnes[$i]->getCivilite()->getNom(),
                    'prenom' => $personnes[$i]->getPrenom(),
                    'nom' => $personnes[$i]->getNom(),
                    'rue' => $personnes[$i]->getAdresse(),
                    'code_postal' => $personnes[$i]->getCodePostal(),
                    'ville' => $personnes[$i]->getVille(),
                    'image_ticket_path' => $imageTicketPath,
                ]));

                $mPdf->Output($uploadDir . '/' . $filename, 'F');
            }
        }
    }

    #[Route('/table/{id}/pdf', name: 'pdf_creation_list')]
    public function createListPersonneOfTable(Table $table): void
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
