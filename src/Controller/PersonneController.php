<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Entity\Personne;
use App\Entity\Table;
use App\Form\EventType;
use App\Form\PersonneType;
use App\Form\TableType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class PersonneController extends AbstractController
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
     * @Route("/personnes/{id}", name="edit_personne")
     */
    public function edit($id, Request $request)
    {
        $newTable = new Table();
        $newPersonne = new Personne();
        $newEvent = new Evenement();

        $tableForm = $this->createForm(TableType::class, $newTable);
        $tableForm->handleRequest($request);
        if ($tableForm->isSubmitted() && $tableForm->isValid()) {
            $this->em->persist($newTable);
            $this->em->flush();
        }

        $personneForm = $this->createForm(PersonneType::class, $newPersonne);
        $personneForm->handleRequest($request);
        if ($personneForm->isSubmitted() && $personneForm->isValid()) {
            $this->em->persist($newPersonne);
            $this->em->flush();
        }

        $allEvents = $this->em->getRepository(Evenement::class)->findAll();
        $eventForm = $this->createForm(EventType::class, count($allEvents) > 0 ? $allEvents[0] : $newEvent);
        $eventForm->handleRequest($request);
        if ($eventForm->isSubmitted() && $eventForm->isValid()) {
            $this->em->persist($newEvent);
            $this->em->flush();
        }

        $allTables = $this->em->getRepository(Table::class)->findAll();
        $allPersonnes = $this->em->getRepository(Personne::class)->findAll();
        $allEvents = $this->em->getRepository(Evenement::class)->findAll();

        $personne = $this->em->getRepository(Personne::class)->find($id);

        $form = $this->createForm(PersonneType::class, $personne);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            dd($personne);
        }

        $allEvents = $this->em->getRepository(Evenement::class)->findAll();
        $eventForm = $this->createForm(EventType::class, count($allEvents) > 0 ? $allEvents[0] : $newEvent);
        $eventForm->handleRequest($request);
        if ($eventForm->isSubmitted() && $eventForm->isValid()) {
            $this->em->persist($newEvent);
            $this->em->flush();
        }

        return $this->render('personne/edit.html.twig', [
            'form' => $form->createView(),
            'table_form' => $tableForm->createView(),
            'personne_form' => $personneForm->createView(),
            'event_form' => $eventForm->createView(),
            'all_tables' => $allTables,
            'all_personnes' => $allPersonnes,
            'event' => count($allEvents) > 0 ? $allEvents[0] : null,
        ]);
    }
}
