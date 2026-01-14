<?php

namespace App\Controller\Api;

use App\Entity\Civilite;
use App\Entity\Personne;
use Doctrine\ORM\EntityManagerInterface;
use PhpOffice\PhpSpreadsheet\RichText\RichText;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class ImportApiController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {}

    #[Route('/import', name: 'api_import', methods: ['POST'])]
    public function import(Request $request): JsonResponse
    {
        $file = $request->files->get('file');

        if (!$file instanceof UploadedFile) {
            return new JsonResponse(['success' => false, 'error' => 'Aucun fichier fourni'], 400);
        }

        if (!$this->verifyFile($file)) {
            return new JsonResponse(['success' => false, 'error' => 'Le fichier doit être de type .xlsx'], 400);
        }

        try {
            $count = $this->importFile($file);
            return new JsonResponse([
                'success' => true,
                'message' => "Importation terminée : {$count} personne(s) importée(s)"
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    private function verifyFile(UploadedFile $file): bool
    {
        $filename = $file->getClientOriginalName();
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        return strtolower($ext) === 'xlsx';
    }

    private function importFile(UploadedFile $file): int
    {
        $inputFileName = $file->getRealPath();
        $inputFileType = \PhpOffice\PhpSpreadsheet\IOFactory::identify($inputFileName);
        $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader($inputFileType);
        $spreadsheet = $reader->load($inputFileName);
        $maxCellValue = $spreadsheet->getActiveSheet()->getHighestDataRow();
        $batchSize = 25;
        $count = 0;

        for ($row = 2; $row <= $maxCellValue; $row++) {
            $civiliteFile = in_array(
                $this->checkRichText($spreadsheet->getActiveSheet()->getCell('B' . $row)->getValue()),
                ["M.", "Mme", "Mlle"]
            )
                ? $this->checkRichText($spreadsheet->getActiveSheet()->getCell('B' . $row)->getValue())
                : 'M.';

            $civilite = $this->em->getRepository(Civilite::class)->findOneBy([
                'nom' => $civiliteFile
            ]);

            $nom = $this->checkRichText($spreadsheet->getActiveSheet()->getCell('C' . $row)->getValue());

            if ($nom !== null && $nom !== "") {
                $personne = new Personne();
                $personne
                    ->setIdCerfa($this->checkRichText($spreadsheet->getActiveSheet()->getCell('A' . $row)->getValue()))
                    ->setCivilite($civilite)
                    ->setNom($nom)
                    ->setPrenom($this->checkRichText($spreadsheet->getActiveSheet()->getCell('D' . $row)->getValue()))
                    ->setTelephone(
                        $this->checkRichText($spreadsheet->getActiveSheet()->getCell('E' . $row)->getValue()) ?? ""
                    )
                    ->setEmail(
                        $this->checkRichText($spreadsheet->getActiveSheet()->getCell('F' . $row)->getValue()) ?? ""
                    )
                    ->setAdresse($this->checkRichText($spreadsheet->getActiveSheet()->getCell('G' . $row)->getValue()))
                    ->setCodePostal($this->checkRichText($spreadsheet->getActiveSheet()->getCell('H' . $row)->getValue()))
                    ->setVille($this->checkRichText($spreadsheet->getActiveSheet()->getCell('I' . $row)->getValue()));

                $this->em->persist($personne);
                $count++;
            }

            if (($row % $batchSize) === 0) {
                $this->em->flush();
                $this->em->clear();
            }
        }

        $this->em->flush();
        $this->em->clear();

        return $count;
    }

    private function checkRichText(mixed $value): mixed
    {
        if ($value instanceof RichText) {
            return $value->getRichTextElements()[0]->getText();
        }
        return $value;
    }
}
