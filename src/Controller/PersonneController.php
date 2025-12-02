<?php

namespace App\Controller;

use App\Entity\Civilite;
use App\Entity\Personne;
use App\Entity\Table;
use App\Form\PersonneType;
use App\Repository\PersonneRepository;
use App\Service\BilletWebService;
use App\Service\SmsService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/personne')]
class PersonneController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly BilletWebService $billetWebService,
        private readonly SmsService $smsService
    ) {}

    #[Route('/', name: 'personne_index', methods: ['GET', 'POST'])]
    public function index(PersonneRepository $repo, Request $request): Response
    {
        $personnes = $repo->findBy([], ['nom' => 'ASC']);
        $personnesHasTable = 0;
        foreach ($personnes as $personne) {
            if ($personne->getTable() !== null) {
                ++$personnesHasTable;
            }
        }
        $personnesPresent = count(array_filter($personnes, function ($n) {
            return $n->getPresent();
        }));

        $filterForm = $this->createFormBuilder()
            ->add('table', CheckboxType::class, [
                'label' => 'Montrer les personnes sans table',
                'required' => false,
            ])
            ->getForm();

        $filterForm->handleRequest($request);

        if ($filterForm->isSubmitted() && $filterForm->isValid()) {
            $data = $filterForm->getData();
            if ($data['table'] === true) {
                $personnes = $repo->findBy(['table' => null], ['nom' => 'ASC']);
            }
        }

        return $this->render('personne/index.html.twig', [
            'filterForm' => $filterForm->createView(),
            'personnes' => $personnes,
            'personnesHasTable' => $personnesHasTable,
            'personnesPresent' => $personnesPresent
        ]);
    }

    #[Route('/new', name: 'personne_new', methods: ['GET', 'POST'])]
    public function new(Request $request): Response
    {
        $personne = new Personne();
        $tableId = $request->query->get('table');
        $form = $tableId
            ? $this->createForm(PersonneType::class, $personne, ['attr' => ['table' => $tableId]])
            : $this->createForm(PersonneType::class, $personne);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->em->persist($personne);
            $this->em->flush();

            if ($request->request->get('action') === "Créer avec un conjoint") {
                return $this->redirectToRoute('conjoint_new', [
                    'id' => $personne->getId()
                ]);
            }

            $this->billetWebService->createPerson($personne);

            return $this->redirectToRoute('home');
        }

        return $this->render('personne/new.html.twig', [
            'personne' => $personne,
            'form' => $form,
        ]);
    }

    #[Route('/{id}/new_conjoint', name: 'conjoint_new', methods: ['GET', 'POST'])]
    public function newConjoint(string $id, Request $request): Response
    {
        $personne = $this->em->getRepository(Personne::class)->find($id);
        $civilite = null;
        $payed = null;
        $paiementDate = null;
        $moyenPaiement = null;

        if ($personne->getCivilite()->getNom() == "M.") {
            $civilite = $this->em->getRepository(Civilite::class)->findOneBy(['nom' => 'Mme']);
        } elseif ($personne->getCivilite()->getNom() == "Mme") {
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

            $this->billetWebService->createCouple($personne, $conjoint);

            return $this->redirectToRoute('home', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('personne/new.html.twig', [
            'conjoint' => $conjoint,
            'form' => $form,
            'title' => "Création du conjoint"
        ]);
    }

    #[Route('/{id}/edit', name: 'personne_edit', methods: ['GET', 'POST'])]
    public function edit(Personne $personne, Request $request): Response
    {
        $form = $this->createForm(PersonneType::class, $personne);
        $form->handleRequest($request);
        $previousPresent = $form->get('previousPresent')->getData();
        if ($form->isSubmitted() && $form->isValid()) {
            $oldValue = $previousPresent === "1";
            $montantBillet = $personne->getMontantBillet();
            $montantPaye = $personne->getMontantPaye();
            $conjoint = $personne->getConjoint();

            if ($conjoint !== null && $montantBillet !== null && $montantBillet == $montantPaye) {
                $conjoint
                    ->setMontantBillet(0)
                    ->setMontantPaye(0)
                    ->setDateReglement($personne->getDateReglement())
                    ->setMoyenPaiement($personne->getMoyenPaiement());

                $this->em->persist($conjoint);
            }

            $doSendSms = false;

            if ($oldValue !== $personne->getPresent() && $personne->getPresent()) {
                $doSendSms = true;
            }

            $this->em->persist($personne);
            $this->em->flush();

            if ($doSendSms) {
                $this->smsService->sendSms($personne);
            }

            return $this->redirectToRoute('home');
        }

        return $this->render('personne/edit.html.twig', [
            'form' => $form->createView(),
            'personne' => $personne
        ]);
    }

    #[Route('/{id}/add_table/{tableId}', name: 'personne_add_to_table', methods: ['GET', 'POST'])]
    public function addToTable($id, $tableId, Request $request): Response
    {
        $personne = $this->em->getRepository(Personne::class)->find($id);
        $table = $this->em->getRepository(Table::class)->find($tableId);
        $isAjax = str_contains($request->headers->get('Accept', ''), 'application/json');

        if (!$personne || !$table) {
            if ($isAjax) {
                return new JsonResponse(['success' => false, 'error' => 'Personne ou table non trouvée'], Response::HTTP_NOT_FOUND);
            }
            return $this->redirectToRoute('home');
        }

        if (count($table->getPersonnes()) >= $table->getNombrePlacesMax()) {
            if ($isAjax) {
                return new JsonResponse(['success' => false, 'error' => 'La table est complète'], Response::HTTP_BAD_REQUEST);
            }
            return $this->redirectToRoute('home');
        }

        $personne->setTable($table);
        $this->em->persist($personne);
        $this->em->flush();

        if ($isAjax) {
            return new JsonResponse([
                'success' => true,
                'personneId' => $personne->getId(),
                'tableId' => $table->getId()
            ]);
        }

        return $this->redirectToRoute('home');
    }

    #[Route('/{id}', name: 'personne_delete', methods: ['POST'])]
    public function delete(Request $request, Personne $personne): Response
    {
        if ($this->isCsrfTokenValid('delete' . $personne->getId(), $request->request->get('_token'))) {
            $conjoint = $personne->getConjoint();
            $principal = $this->em->getRepository(Personne::class)->findOneBy(['conjoint' => $personne]);

            if ($conjoint instanceof Personne) {
                $conjoint->setConjoint(null);
                $personne->setConjoint(null);

                $this->em->persist($conjoint);
            } elseif ($principal instanceof Personne) {
                $principal->setConjoint(null);
                $personne->setConjoint(null);

                $this->em->persist($principal);
            }

            $this->em->remove($personne);
            $this->em->flush();
        }

        $this->addFlash('success', 'Personne supprimée');

        return $this->redirect($request->headers->get('referer'));
    }
}
