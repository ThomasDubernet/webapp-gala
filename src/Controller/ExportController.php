<?php

namespace App\Controller;

use App\Repository\EvenementRepository;
use App\Repository\PersonneRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Mime\FileinfoMimeTypeGuesser;

class ExportController extends AbstractController
{
    /**
     * @Route("/export", name="export")
     */
    public function export(PersonneRepository $personneRepo, EvenementRepository $eventRepo)
    {
        $personnes = $personneRepo->findBy([], ['nom' => "ASC"]);
        $event = $eventRepo->findAll()[0];
        $eventName = $event->getNom();
        $filename = str_replace(' ', '_', $eventName) . '.xlsx';

        $letters = [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'
        ];

        $categories = [
            'N° Donateur',
            'Présent',
            'Civilité',
            'Nom',
            'Prénom',
            'Catégorie',
            'Téléphone',
            'Mail',
            'Adresse',
            'Code postal',
            'Ville',
            'Montant billet',
            'Montant payé',
            'Date de règlement',
            'Moyen de paiement',
            'Table'
        ];

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Create Header File
        foreach ($letters as $key => $letter) {
            $sheet->setCellValue($letter . '1', $categories[$key]);
            $sheet->getColumnDimension($letter)->setAutoSize(true);
        }

        $sheet->getRowDimension("1")->setRowHeight(25, 'pt');
        $sheet->getStyle("1")->getFont()->setBold(true);
        $sheet->getStyle("1")->getAlignment()->setVertical('center');
        $sheet->getStyle('A:P')->getAlignment()->setHorizontal('center');

        $startLineNumber = 2;

        foreach ($personnes as $personne) {
            $presence= "";
            if ( $personne->getPresent() ) {
                $presence = "Oui";
            } else {
                $presence = "Non";
            }
            
            $sheet->setCellValue('A' . $startLineNumber, $personne->getIdCerfa() !== null ? $personne->getIdCerfa() : null);
            $sheet->setCellValue('B' . $startLineNumber, $presence);
            $sheet->setCellValue('C' . $startLineNumber, $personne->getCivilite() !== null ? $personne->getCivilite()->getNom() : null);
            $sheet->setCellValue('D' . $startLineNumber, $personne->getNom() !== null ? $personne->getNom() : null);
            $sheet->setCellValue('E' . $startLineNumber, $personne->getPrenom() !== null ? $personne->getPrenom() : null);
            $sheet->setCellValue('F' . $startLineNumber, $personne->getCategorie() !== null ? $personne->getCategorie()->getNom() : null);
            $sheet->setCellValue('G' . $startLineNumber, $personne->getTelephone() !== null ? $personne->getTelephone() : null);
            $sheet->setCellValue('H' . $startLineNumber, $personne->getEmail() !== null ? $personne->getEmail() : null);
            $sheet->setCellValue('I' . $startLineNumber, $personne->getAdresse() !== null ? $personne->getAdresse() : null);
            $sheet->setCellValue('J' . $startLineNumber, $personne->getCodePostal() !== null ? $personne->getCodePostal() : null);
            $sheet->setCellValue('K' . $startLineNumber, $personne->getVille() !== null ? $personne->getVille() : null);
            $sheet->setCellValue('L' . $startLineNumber, $personne->getMontantBillet() !== null ? $personne->getMontantBillet() : null);
            $sheet->setCellValue('M' . $startLineNumber, $personne->getMontantPaye() !== null ? $personne->getMontantPaye() : null);
            $sheet->setCellValue('N' . $startLineNumber, $personne->getDateReglement() !== null ? $personne->getDateReglement()->format('d/m/Y') : null);
            $sheet->setCellValue('O' . $startLineNumber, $personne->getMoyenPaiement() !== null ? $personne->getMoyenPaiement() : null);
            $sheet->setCellValue('P' . $startLineNumber, $personne->getTable() !== null ? "T" . $personne->getTable()->getNumero() . " | " . $personne->getTable()->getNom() : null);;

            $sheet->getRowDimension("$startLineNumber")->setRowHeight(25, 'pt');
            $sheet->getStyle("$startLineNumber")->getAlignment()->setVertical('center');

            $startLineNumber++;
        }

        $writer = new Xlsx($spreadsheet);

        $filePath = $this->getParameter('kernel.project_dir') . '/public/uploads/' . $filename;
        $writer->save($filePath);

        $response = $this->file($filePath);
        $mimeTypeGuesser = new FileinfoMimeTypeGuesser();

        if ($mimeTypeGuesser->isGuesserSupported()) {
            $response->headers->set('Content-Type', $mimeTypeGuesser->guessMimeType($filePath)); 
        } else {
            $response->headers->set('Content-Type', 'text/plain');
        }

        return $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $filename
        );
    }
}
