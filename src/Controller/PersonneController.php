<?php

namespace App\Controller;

use App\Entity\Civilite;
use App\Entity\Personne;
use App\Entity\Table;
use App\Form\PersonneType;
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
     * @Route("/", name="personne_index", methods={"GET"})
     */
    public function index(PersonneRepository $repo): Response
    {
        return $this->render('personne/index.html.twig', [
            'personnes' => $repo->findBy([], ['nom' => 'ASC'])
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
                $this->pdfController->createTicket($personne);
                $this->mailerController->sendTicket($personne);

                return $this->redirectToRoute('conjoint_new', [
                    'id' => $personne->getId()
                ]);
            }
            $this->em->persist($personne);
            $this->em->flush();

            $this->pdfController->createTicket($personne);
            $this->mailerController->sendTicket($personne);
            return $this->redirectToRoute('home');
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
        $civilite = null;
        $payed = null;
        $paiementDate = null;
        $moyenPaiement = null;

        if ($personne->getCivilite()->getNom() == "M.") {
            $civilite = $this->em->getRepository(Civilite::class)->findOneBy(['nom' => 'Mme']);
        } else if ($personne->getCivilite()->getNom() == "Mme") {
            $civilite = $this->em->getRepository(Civilite::class)->findOneBy(['nom' => 'M.']);
        }
        if ($personne->getMontantBillet() !== null && $personne->getMontantBillet() == $personne->getMontantPaye()) {
            $payed = 0;
            $paiementDate = $personne->getDateReglement();
            $moyenPaiement = $personne->getMoyenPaiement();
        }
        $conjoint = new Personne();

        $conjoint
            ->setCivilite($civilite)
            ->setNom($personne->getNom() != null ? $personne->getNom() : null)
            ->setAdresse($personne->getAdresse() != null ? $personne->getAdresse() : null)
            ->setCodePostal($personne->getCodePostal() != null ? $personne->getCodePostal() : null)
            ->setVille($personne->getVille() != null ? $personne->getVille() : null)
            ->setEmail($personne->getEmail() != null ? $personne->getEmail() : null)
            ->setTelephone($personne->getTelephone() != null ? $personne->getTelephone() : null)
            ->setCategorie($personne->getCategorie() != null ? $personne->getCategorie() : null)
            ->setTable($personne->getTable() != null ? $personne->getTable() : null)
            ->setDateReglement($paiementDate)
            ->setMoyenPaiement($moyenPaiement)
            ->setMontantBillet($payed)
            ->setMontantPaye($payed);

        $form = $this->createForm(PersonneType::class, $conjoint);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $conjoint->setConjoint($personne);
            $personne->setConjoint($conjoint);
            $this->em->persist($conjoint);
            $this->em->persist($personne);
            $this->em->flush();

            $this->pdfController->createTicket($conjoint);
            $this->mailerController->sendTicket($conjoint);

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
            $montantBillet = $personne->getMontantBillet();
            $montantPaye = $personne->getMontantPaye();
            $conjoint = $personne->getConjoint();

            if ($personne->getMailEnvoye() !== true) {
                $this->mailerController->sendTicket($personne);
                
                if ($conjoint !== null && $conjoint->getMailEnvoye() !== true) {
                    $this->mailerController->sendTicket($conjoint);
                }
            }

            if ($conjoint !== null && $montantBillet !== null && $montantBillet == $montantPaye) {
                $conjoint
                    ->setMontantBillet(0)
                    ->setMontantPaye(0)
                    ->setDateReglement($personne->getDateReglement())
                    ->setMoyenPaiement($personne->getMoyenPaiement());
                    
                $this->em->persist($conjoint);
            }

            $this->em->persist($personne);
            $this->em->flush();

            return $this->redirectToRoute('home');
        }

        return $this->render('personne/edit.html.twig', [
            'form' => $form->createView(),
            'personne' => $personne
        ]);
    }

    /**
     * @Route("/{id}/add_table/{tableId}", name="personne_add_to_table", methods={"GET"})
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
            if ($personne->getConjoint() !== null) {
                $conjoint = $personne->getConjoint();
                $conjoint->setConjoint(null);
                $personne->setConjoint(null);

                $this->em->persist($conjoint);
            }
            $this->em->remove($personne);
            $this->em->flush();
        }

        return $this->redirectToRoute('home', [], Response::HTTP_SEE_OTHER);
    }
}
