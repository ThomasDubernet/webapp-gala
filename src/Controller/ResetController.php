<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Entity\MediaObject;
use App\Entity\Personne;
use App\Entity\Table;
use App\Entity\Ticket;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Filesystem\Filesystem;

/**
 * @Route("/reset")
 */
class ResetController extends AbstractController
{
    /**
     * @var EntityManagerInterface
     */
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * @Route("/simple", name="reset_simple")
     */
    public function resetBase()
    {
        $this->simpleCleanDatabase();

        return $this->redirectToRoute('home');
    }

    /**
     * @Route("/all", name="reset_all")
     */
    public function resetAll()
    {
        $events = $this->em->getRepository(Evenement::class)->findAll();
        $medias = $this->em->getRepository(MediaObject::class)->findAll();
        $fs = new Filesystem();
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public' . $this->getParameter('upload_directory');

        foreach ($events as $event) {
            if ($event->getPlan() !== null) {
                $planPath = $event->getPlan()->filePath;
                $event->setPlan(null);

                $fs->remove($uploadDir . "/" . $planPath);
                $this->em->persist($event);
                $this->em->flush();
            }
            if ($event->getImageTicket() !== null) {
                $imagePath = $event->getImageTicket()->filePath;
                $event->setImageTicket(null);
                
                $fs->remove($uploadDir . "/" . $imagePath);
                $this->em->persist($event);
                $this->em->flush();
            }
            
            $this->em->remove($event);
        }
        foreach ($medias as $media) {
            $this->em->remove($media);
        }

        $newEvent = new Evenement();
        $this->em->persist($newEvent);

        $this->simpleCleanDatabase();

        return $this->redirectToRoute('home');
    }
    
    public function simpleCleanDatabase()
    {
        $personnes = $this->em->getRepository(Personne::class)->findAll();
        $tables = $this->em->getRepository(Table::class)->findAll();
        $tickets = $this->em->getRepository(Ticket::class)->findAll();
        $fs = new Filesystem();
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public' . $this->getParameter('upload_directory');
    
        foreach ($personnes as $personne) {
            if ($personne->getConjoint() !== null) {
                $conjoint = $personne->getConjoint();
                $conjoint->setConjoint(null);
                $personne->setConjoint(null);
                $this->em->persist($personne);
                $this->em->persist($conjoint);
                $this->em->flush();
            }
            $this->em->remove($personne);
            $this->em->flush();
        }
        foreach ($tables as $table) {
            $this->em->remove($table);
        }
        foreach ($tickets as $ticket) {
            $fichier = $ticket->getFichier();
            $fs->remove($uploadDir . "/" . $fichier);
            $this->em->remove($ticket);
        }
    
        $this->em->flush();
    }
}
