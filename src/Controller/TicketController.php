<?php

namespace App\Controller;

use App\Entity\Personne;
use App\Entity\Ticket;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/ticket")
 */
class TicketController extends AbstractController
{
    /**
     * @var EntityManagerInterface
     */
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function create(string $filename, Personne $personne, $flush = true): Ticket
    {
        $allTickets = $this->em->getRepository(Ticket::class)->findAllByNumero();
        if (count($allTickets) > 0) {
            $newNumero = $allTickets[0]->getNumero() + 1;
        } else {
            $newNumero = 1;
        }
        
        $ticket = new Ticket();
        $ticket
            ->setFichier($filename)
            ->setNumero($newNumero)
            ->setPersonne($personne)
        ;
        $personne->setTicket($ticket);
        
        $this->em->persist($ticket);
        $this->em->persist($personne);
        
        if ($flush) {
            $this->em->flush();
        }
        return $ticket;
    }
}
