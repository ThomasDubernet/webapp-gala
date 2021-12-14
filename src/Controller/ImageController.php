<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Entity\Table;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Knp\Snappy\Image;

class ImageController extends AbstractController
{
    /**
     * @Route("/knp/screenshot")
     */
    public function index(Image $imageGenerator, EntityManagerInterface $em)
    {
        $uniqId = uniqid();
        $filename = "plan$uniqId.jpg";
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public' . $this->getParameter('upload_directory');
        
        $allEvents = $em->getRepository(Evenement::class)->findAll();
        $plan_path = $allEvents[0]->getPlan()->filePath;

        $tables = $em->getRepository(Table::class)->findAll();

        // $imageGenerator->generateFromHtml(
        //     $this->renderView(
        //         'knp/plan_table.html.twig', [
        //             'plan_path' => $this->getParameter('upload_directory') . "/" . $plan_path,
        //             'tables' => $tables
        //         ]
        //     ),
        //     $uploadDir . "/" . $filename
        // );

        // return $this->render('home/index.html.twig');
        return $this->render('knp/plan_table.html.twig', [
            'plan_path' => $this->getParameter('upload_directory') . "/" . $plan_path,
            'tables' => $tables
        ]);
    }
}