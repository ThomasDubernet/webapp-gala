<?php

namespace App\Controller;

use App\Entity\Table;
use App\Form\TableType;
use App\Repository\TableRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/table")
 */
class TableController extends AbstractController
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
     * @Route("/new", name="table_new", methods={"GET", "POST"})
     */
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $table = new Table();
        $form = $this->createForm(TableType::class, $table);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $table
                ->setPosX('50.00')
                ->setPosY('-50.00');
            $this->em->persist($table);
            $this->em->flush();

            return $this->redirectToRoute('home', [], Response::HTTP_SEE_OTHER);
        }

        return $this->renderForm('table/new.html.twig', [
            'table' => $table,
            'form' => $form,
        ]);
    }

    /**
     * @Route("/{id}/edit", name="table_edit", methods={"GET", "POST"})
     */
    public function edit(Table $table, Request $request): Response
    {
        $form = $this->createForm(TableType::class, $table);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->em->persist($table);
            $this->em->flush();

            return $this->redirectToRoute('home');
        }

        return $this->render('table/edit.html.twig', [
            'table' => $table,
            'form' => $form->createView(),
        ]);
    }
}
