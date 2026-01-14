<?php

namespace App\Controller;

use App\Entity\Table;
use App\Service\MpdfFactory;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;

class PdfController extends AbstractController
{
    public function __construct(
        private readonly MpdfFactory $MpdfFactory
    ) {}

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
