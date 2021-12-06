<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Entity\Personne;
use App\Entity\Table;
use App\Form\EventType;
use App\Form\PersonneType;
use App\Form\TableType;
use App\Repository\PersonneRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/personne")
 */
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
     * @Route("/", name="personne_index", methods={"GET"})
     */
    public function index(PersonneRepository $repo): Response
    {
        return $this->render('personne/index.html.twig', [
            'personnes' => $repo->findAll()
        ]);
    }

    /**
     * @Route("/new", name="personne_new", methods={"GET", "POST"})
     */
    public function new(Request $request): Response
    {
        $personne = new Personne();
        $form = isset($_GET['table'])
            ? $this->createForm(PersonneType::class, $personne, ['attr' => ['table' =>  $_GET['table']]])
            : $this->createForm(PersonneType::class, $personne);

        $form->handleRequest($request);


        if ($form->isSubmitted() && $form->isValid()) {
            if ($_POST['action'] == "Créer avec un conjoint") {
                $this->em->persist($personne);
                $this->em->flush();

                return $this->redirectToRoute('conjoint_new', [
                    'id' => $personne->getId()
                ]);
            }
            $this->em->persist($personne);
            $this->em->flush();

            return $this->redirectToRoute('home', [], Response::HTTP_SEE_OTHER);
        }

        return $this->renderForm('personne/new.html.twig', [
            'personne' => $personne,
            'form' => $form,
        ]);
    }

    /**
     * @Route("/{id}/new_conjoint", name="conjoint_new", methods={"GET", "POST"})
     */
    public function newConjoint($id, Request $request): Response
    {
        $personne = $this->em->getRepository(Personne::class)->find($id);
        $conjoint = new Personne();
        $form = $this->createForm(PersonneType::class, $conjoint);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $conjoint->setConjoint($personne);
            $personne->setConjoint($conjoint);
            $this->em->persist($conjoint);
            $this->em->persist($personne);
            $this->em->flush();

            return $this->redirectToRoute('home', [], Response::HTTP_SEE_OTHER);
        }

        return $this->renderForm('personne/new.html.twig', [
            'conjoint' => $conjoint,
            'form' => $form,
            'title' => "Création du conjoint"
        ]);
    }

    /**
     * @Route("/{id}/edit", name="personne_edit", methods={"GET", "POST"})
     */
    public function edit(Personne $personne, Request $request): Response
    {
        $form = $this->createForm(PersonneType::class, $personne);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $this->em->persist($personne);
            $this->em->flush();

            return $this->redirectToRoute('home', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('personne/edit.html.twig', [
            'form' => $form->createView(),
            'personne' => $personne
        ]);
    }

    /**
     * @Route("/{id}/add-table/{tableId}", name="personne_add_to_table", methods={"GET"})
     */
    public function addToTable($id, $tableId): Response
    {
        $personne = $this->em->getRepository(Personne::class)->find($id);
        $table = $this->em->getRepository(Table::class)->find($tableId);
        $personne->setTable($table);
        $this->em->persist($personne);
        $this->em->flush();

        return $this->redirectToRoute('home', [], Response::HTTP_SEE_OTHER);
    }

    /**
     * @Route("/{id}", name="personne_delete", methods={"POST"})
     */
    public function delete(Request $request, Personne $personne): Response
    {
        if ($this->isCsrfTokenValid('delete' . $personne->getId(), $request->request->get('_token'))) {
            $this->em->remove($personne);
            $this->em->flush();
        }

        return $this->redirectToRoute('home', [], Response::HTTP_SEE_OTHER);
    }
}
