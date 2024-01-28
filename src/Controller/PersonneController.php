<?php

namespace App\Controller;

use App\Entity\Civilite;
use App\Entity\Evenement;
use App\Entity\Personne;
use App\Entity\Table;
use App\Form\PersonneType;
use App\Repository\PersonneRepository;
use Doctrine\ORM\EntityManagerInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\RequestOptions;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/personne")
 */
class PersonneController extends AbstractController
{
    public const BILLET_WEB_API_URL = 'https://www.billetweb.fr';

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

    /**
     * @var SmsController
     */
    private $smsController;

    public function __construct(
        EntityManagerInterface $em,
        PdfController $pdfController,
        MailerController $mailerController,
        SmsController $smsController
    ) {
        $this->em = $em;
        $this->pdfController = $pdfController;
        $this->mailerController = $mailerController;
        $this->smsController = $smsController;
    }

    /**
     * @Route("/", name="personne_index", methods={"GET", "POST"})
     */
    public function index(PersonneRepository $repo, Request $request): Response
    {
        $personnes = $repo->findBy([], ['nom' => 'ASC']);
        $personnesHasTable = 0;
        foreach ($personnes as $personne) {
            if ($personne->getTable() !== null) ++$personnesHasTable;
        }
        $personnesPresent = count(array_filter($personnes, function ($n) {
            return $n->getPresent();
        }));

        $filterForm = $this->createFormBuilder()
            ->add('table', CheckboxType::class, [
                'label'    => 'Montrer les personnes sans table',
                'required' => false,
            ])
            ->getForm();

        $filterForm->handleRequest($request);

        if ($filterForm->isSubmitted() && $filterForm->isValid()) {
            $data = $filterForm->getData();
            if ($data['table'] === true) {
                $personnes =$repo->findBy(['table' => null], ['nom' => 'ASC']);
            }
        }

        return $this->render('personne/index.html.twig', [
            'filterForm' => $filterForm->createView(),
            'personnes' => $personnes,
            'personnesHasTable' => $personnesHasTable,
            'personnesPresent' => $personnesPresent
        ]);
    }

    /**
     * @Route("/new", name="personne_new", methods={"GET", "POST"})
     * @throws GuzzleException
     */
    public function new(Request $request): Response
    {
        $personne = new Personne();
        $form = isset($_GET['table'])
            ? $this->createForm(PersonneType::class, $personne, ['attr' => ['table' =>  $_GET['table']]])
            : $this->createForm(PersonneType::class, $personne);

        $form->handleRequest($request);


        if ($form->isSubmitted() && $form->isValid()) {
            $this->em->persist($personne);
            $this->em->flush();
            if ($_POST['action'] == "Créer avec un conjoint") {
                // $this->pdfController->createTicket($personne);
                // $this->mailerController->sendTicket($personne);

                return $this->redirectToRoute('conjoint_new', [
                    'id' => $personne->getId()
                ]);
            }

            $httpClient = new Client([
                'base_uri' => self::BILLET_WEB_API_URL,
            ]);
            $currentEvent = $this->em->getRepository(Evenement::class)->findAll()[0] ?? null;

            if($currentEvent === null) {
                return $this->json([
                    'error' => 'ERROR_CREATE_PERSONNE_BILLET_WEB_001',
                    'status' => 'error',
                ], Response::HTTP_BAD_REQUEST);
            }

            $billetWebId = $currentEvent->getBilletwebId();

            $httpClient->request('POST', '/api/event/'.$billetWebId.'/add_order', [
                'headers' => [
                    'Authorization' => "Basic ".$_ENV['BILLET_WEB_BASIC']
                ],
                'json' => [
                    'data' => [
                        [
                            'name' => $personne->getNom(),
                            'firstname' => $personne->getPrenom(),
                            'email' => $personne->getEmail(),
                            'session' => '0', // TODO check à quoi ça correspond
                            'payment_type' => 'other',
                            'products' => [
                                [
                                    'ticket' => 'Import Appli BR',
                                    'name' => $personne->getNom(),
                                    'firstname' => $personne->getPrenom(),
                                    'email' => $personne->getEmail(),
                                    'price' => $personne->getMontantPaye(),
                                    'used' => 0,
                                    'custom' => [
                                        'Portable' => '+33'.$personne->getTelephone(),
                                        'Adresse' => $personne->getAdresse(),
                                        'Code Postal' => $personne->getCodePostal(),
                                        'Ville' => $personne->getVille(),
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]);

            // $this->pdfController->createTicket($personne);
            // $this->mailerController->sendTicket($personne);
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


            $httpClient = new Client([
                'base_uri' => self::BILLET_WEB_API_URL,
            ]);
            $currentEvent = $this->em->getRepository(Evenement::class)->findAll()[0] ?? null;

            if($currentEvent === null) {
                return $this->json([
                    'error' => 'ERROR_CREATE_PERSONNE_BILLET_WEB_001',
                    'status' => 'error',
                ], Response::HTTP_BAD_REQUEST);
            }

            $billetWebId = $currentEvent->getBilletwebId();

            $httpClient->request('POST', '/api/event/'.$billetWebId.'/add_order', [
                'headers' => [
                    'Authorization' => "Basic ".$_ENV['BILLET_WEB_BASIC']
                ],
                'json' => [
                    'data' => [
                        [
                            'name' => $personne->getNom(),
                            'firstname' => $personne->getPrenom(),
                            'email' => $personne->getEmail(),
                            'session' => '0',
                            'payment_type' => 'other',
                            'products' => [
                                [
                                    'ticket' => 'Import Appli BR',
                                    'name' => $personne->getNom(),
                                    'firstname' => $personne->getPrenom(),
                                    'email' => $personne->getEmail(),
                                    'price' => $personne->getMontantPaye(),
                                    'used' => 0,
                                    'custom' => [
                                        'Portable' => '+33'.$personne->getTelephone(),
                                        'Adresse' => $personne->getAdresse(),
                                        'Code Postal' => $personne->getCodePostal(),
                                        'Ville' => $personne->getVille(),
                                    ]
                                ]
                            ]
                        ],
                        [
                            'name' => $personne->getNom(),
                            'firstname' => $personne->getPrenom(),
                            'email' => $personne->getEmail(),
                            'session' => '0',
                            'payment_type' => 'other',
                            'products' => [
                                [
                                    'ticket' => 'Import Appli BR',
                                    'name' => $conjoint->getNom(),
                                    'firstname' => $conjoint->getPrenom(),
                                    'email' => $conjoint->getEmail(),
                                    'price' => $conjoint->getMontantPaye(),
                                    'used' => 0,
                                    'custom' => [
                                        'Portable' => '+33'.$personne->getTelephone(),
                                        'Adresse' => $personne->getAdresse(),
                                        'Code Postal' => $personne->getCodePostal(),
                                        'Ville' => $personne->getVille(),
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]);

            // $this->pdfController->createTicket($conjoint);
            // $this->mailerController->sendTicket($conjoint);

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
        $previousPresent = $form->get('previousPresent')->getData();
        if ($form->isSubmitted() && $form->isValid()) {
            $oldValue = $previousPresent === "1";
            $montantBillet = $personne->getMontantBillet();
            $montantPaye = $personne->getMontantPaye();
            $conjoint = $personne->getConjoint();

            // if ($personne->getMailEnvoye() !== true) {
            //     $this->mailerController->sendTicket($personne);

            //     if ($conjoint !== null && $conjoint->getMailEnvoye() !== true) {
            //         $this->mailerController->sendTicket($conjoint);
            //     }
            // }

            if ($conjoint !== null && $montantBillet !== null && $montantBillet == $montantPaye) {
                $conjoint
                    ->setMontantBillet(0)
                    ->setMontantPaye(0)
                    ->setDateReglement($personne->getDateReglement())
                    ->setMoyenPaiement($personne->getMoyenPaiement());

                $this->em->persist($conjoint);
            }

            if ($oldValue !== $personne->getPresent() && $personne->getPresent()) {
                $numero_table = $personne->getTable()->getNumero();
                $telephone = $personne->getTelephone();
                $this->smsController->sendSms($numero_table, $telephone);
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
            $conjoint = $personne->getConjoint();
            $principal = $this->em->getRepository(Personne::class)->findOneBy(['conjoint' => $personne]);

            if ($conjoint instanceof Personne) {
                $conjoint->setConjoint(null);
                $personne->setConjoint(null);

                $this->em->persist($conjoint);
            } elseif ($principal instanceof Personne){
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
