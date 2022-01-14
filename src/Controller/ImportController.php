<?php

namespace App\Controller;

use App\Entity\Civilite;
use App\Entity\Personne;
use Doctrine\ORM\EntityManagerInterface;
use PhpOffice\PhpSpreadsheet\RichText\RichText;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ImportController extends AbstractController
{
    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var PdfController
     */
    private $pdfController;

    /**
     * @var MailerController
     */
    private $mailerController;
    
    public function __construct(
        EntityManagerInterface $em,
        PdfController $pdfController,
        MailerController $mailerController
    )
    {
        $this->em = $em;
        $this->pdfController = $pdfController;
        $this->mailerController = $mailerController;
    }

    /**
     * @Route("/import", name="import")
     */
    public function index(Request $request)
    {
        $file = $request->files->get('import')['importFile'];
        $currentUrl = $request->request->get('current_url');
        if ($file instanceof UploadedFile && $this->verify($file)) {
            $this->import($file);
        } else {
            return $this->renderForm('home/index.html.twig', [
                'message' => [
                    "type" => "danger",
                    "text" => "Le fichier doit être de type .xlsx"
                ]
            ]);
        }

        return $this->redirect($currentUrl);
    }

    public function verify(UploadedFile $file): bool
    {
        $filename = $file->getClientOriginalName();

        $ext = explode('.', $filename)[1];

        if ( $ext !== "xlsx" ) {
            return false;
        }

        return true;
    }

    public function import(UploadedFile $file)
    {
        $inputFileName = $file->getRealPath();
        $inputFileType = \PhpOffice\PhpSpreadsheet\IOFactory::identify($inputFileName);
        $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader($inputFileType);
        $spreadsheet = $reader->load($inputFileName);
        $maxCellValue = $spreadsheet->getActiveSheet()->getHighestDataRow();

        for ($row = 2; $row <= $maxCellValue; $row++) {
            $personne = new Personne();
            $civiliteFile = $this->checkRichText($spreadsheet->getActiveSheet()->getCell('B'.$row)->getValue());
            $civilite = $this->em->getRepository(Civilite::class)->findOneBy([
                'nom' => $civiliteFile
            ]);

            $personne
                ->setIdCerfa($this->checkRichText($spreadsheet->getActiveSheet()->getCell('A'.$row)->getValue()))
                ->setCivilite($civilite)
                ->setNom($this->checkRichText($spreadsheet->getActiveSheet()->getCell('C'.$row)->getValue()))
                ->setPrenom($this->checkRichText($spreadsheet->getActiveSheet()->getCell('D'.$row)->getValue()))
                ->setTelephone($this->checkRichText($spreadsheet->getActiveSheet()->getCell('E'.$row)->getValue()))
                ->setEmail($this->checkRichText($spreadsheet->getActiveSheet()->getCell('F'.$row)->getValue()))
                ->setAdresse($this->checkRichText($spreadsheet->getActiveSheet()->getCell('G'.$row)->getValue()))
                ->setCodePostal($this->checkRichText($spreadsheet->getActiveSheet()->getCell('H'.$row)->getValue()))
                ->setVille($this->checkRichText($spreadsheet->getActiveSheet()->getCell('I'.$row)->getValue()));

            $this->em->persist($personne);
            $this->em->flush();

            $this->pdfController->createTicket($personne);
            $this->mailerController->sendTicket($personne);
        }
    }

    public function checkRichText($value) {
        if ($value instanceof RichText) {
            return $value->getRichTextElements()[0]->getText();
        }
        return $value;
    }
}
