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
use Symfony\Component\HttpFoundation\Response;

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
    public function resetBase(): Response
    {
        $this->simpleCleanDatabase();

        return $this->redirectToRoute('home');
    }

    /**
     * @Route("/all", name="reset_all")
     */
    public function resetAll(): Response
    {
        $events = $this->em->getRepository(Evenement::class)->findAll();
        $medias = $this->em->getRepository(MediaObject::class)->findAll();
        $fs = new Filesystem();
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public' . $this->getParameter('upload_directory');


        $this->em->beginTransaction();
        try {
            foreach ($events as $event) {
                if ($event->getPlan() !== null) {
                    $planPath = $event->getPlan()->filePath;
                    $event
                        ->setPlan(null)
                        ->setBilletwebId(null)
                        ->setLastUpdateBilletWeb(null);

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
                $this->em->flush();
            }
            foreach ($medias as $media) {
                $this->em->remove($media);
            }

            $newEvent = new Evenement();
            $this->em->persist($newEvent);
            $this->em->flush();
            $this->em->commit();

            $this->simpleCleanDatabase();
        } catch (\Exception $exception) {
            $this->em->rollback();
            $this->addFlash('error', "Une erreur est survenue lors de la suppression des données.");
        }

        return $this->redirectToRoute('home');
    }

    public function simpleCleanDatabase()
    {
        $personnes = $this->em->getRepository(Personne::class)->findAll();
        $tables = $this->em->getRepository(Table::class)->findAll();
        $tickets = $this->em->getRepository(Ticket::class)->findAll();
        $fs = new Filesystem();
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public' . $this->getParameter('upload_directory');

        $this->em->beginTransaction();

        try {
            $events = $this->em->getRepository(Evenement::class)->findAll();

            foreach ($events as $event) {
                $event->setLastUpdateBilletWeb(null);
                $this->em->persist($event);
            }

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
            }
            foreach ($tables as $table) {
                $this->em->remove($table);
            }
            if (count($tickets) > 0) {
                foreach ($tickets as $ticket) {
                    $fichier = $ticket->getFichier();
                    $fs->remove($uploadDir . "/" . $fichier);
                    $this->em->remove($ticket);
                }
            }

            $this->em->flush();
            $this->em->commit();
            $this->addFlash('success', "Suppression des personnes terminée !");
        } catch (\Exception $exception) {
            $this->em->rollback();
            $this->addFlash('error', "Une erreur est survenue lors de la suppression des données.");
        }
    }

    /**
     * @Route("/personnes", name="reset_personnes")
     */
    public function cleanPersonnesWithoutTable(): Response
    {
        $personnes = $this->em->getRepository(Personne::class)->findBy(['table' => null]);
        $tickets = [];
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public' . $this->getParameter('upload_directory');
        $fs = new Filesystem();

        $this->em->beginTransaction();

        try {
            foreach ($personnes as $personne) {
                if ($personne->getTicket() !== null) {
                    $tickets[] = $personne->getTicket();
                }
                if ($personne->getConjoint() !== null) {
                    $conjoint = $personne->getConjoint();
                    $personne->setConjoint(null);
                    $conjoint->setConjoint(null);
                    $this->em->persist($personne);
                    $this->em->persist($conjoint);
                    $this->em->flush();
                }
                $this->em->remove($personne);
            }
            if (count($tickets) > 0) {
                foreach ($tickets as $ticket) {
                    $fichier = $ticket->getFichier();
                    $fs->remove($uploadDir . "/" . $fichier);
                    $this->em->remove($ticket);
                }
            }
            $this->em->flush();
            $this->em->commit();
            $this->addFlash('success', "Suppression terminée !");
        } catch (\Exception $exception) {
            $this->em->rollback();
            $this->addFlash('error', "Une erreur est survenue lors de la suppression des données.");
        }

        return $this->redirectToRoute('home', [], Response::HTTP_SEE_OTHER);
    }
}
