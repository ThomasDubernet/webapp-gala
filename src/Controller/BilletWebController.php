<?php

namespace App\Controller;

use App\Entity\Civilite;
use App\Entity\Evenement;
use App\Entity\Personne;
use Doctrine\ORM\EntityManagerInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class BilletWebController extends AbstractController
{
    public const BILLET_WEB_API_URL = 'https://www.billetweb.fr';

    private $em;
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * @Route("/api/billet-web/sync", name="billet_web_sync_post", methods={"POST"})
     */
    public function index(): Response
    {
        $newLastSyncDate = new \DateTime();
        $currentEvent = $this->em->getRepository(Evenement::class)->findAll()[0] ?? null;

        if($currentEvent === null) {
            return $this->json([
                'error' => 'ERROR_SYNC_BILLET_WEB_001',
                'status' => 'error',
                'message' => 'No event found'
            ], Response::HTTP_BAD_REQUEST);
        }

        $billetWebId = $currentEvent->getBilletwebId();
        $lastSyncDate = $currentEvent->getLastUpdateBilletWeb();

        if($billetWebId === null) {
            return $this->json([
                'error' => 'ERROR_SYNC_BILLET_WEB_002',
                'status' => 'error',
                'message' => 'No billet web id found'
            ], Response::HTTP_BAD_REQUEST);
        }

        $apiUrl = '/api/event/'.$billetWebId.'/attendees';

        if($lastSyncDate !== null) {
            $lastSyncTimestamp = $lastSyncDate->getTimestamp();
            $apiUrl .= '?last_update='.$lastSyncTimestamp;
        }

        try {
            $client = new Client([
                'base_uri' => self::BILLET_WEB_API_URL,
            ]);

            $response = $client->request('GET', $apiUrl, [
                'headers' => [
                    'Authorization' => "Basic ".$_ENV['BILLET_WEB_BASIC']
                ]
            ]);

            $responseContent = json_decode($response->getBody()->getContents(), true);

            if (isset($responseContent['error'])) {
                return $this->json([
                    'error' => 'ERROR_SYNC_BILLET_WEB_003 - '.$responseContent['error'],
                    'status' => 'error',
                    'message' => $responseContent['description']
                ], Response::HTTP_BAD_REQUEST);
            }

            // Créer un tableau des commandes
            $orders = [];
            foreach($responseContent as $customer) {
                $orderExtId = $customer['order_ext_id'];

                $orders[$orderExtId][] = $customer;
            }

            $count = 0;

            $monsieurCivilite = $this->em->getRepository(Civilite::class)->findOneBy(['nom' => 'M.']);
            $madameCivilite = $this->em->getRepository(Civilite::class)->findOneBy(['nom' => 'Mme']);

            // On parcours les commandes
            foreach ($orders as $orderExtId => $customers) {
                if (count($customers) === 2) {
                    $principal = null;
                    $conjoint = null;

                    foreach ($customers as $customer) {
                        if ($customer['firstname'] === $customer['order_firstname'] && $principal === null) {
                            $principal = $customer;
                        } else {
                            $conjoint = $customer;
                        }
                    }

                    if ($principal === null || $conjoint === null) {
                        $principal = $customers[0];
                        $conjoint = $customers[1];
                    }

                    $ticketExtId = $principal['ext_id'];
                    $principalCustomer = $this->em->getRepository(Personne::class)->findOneBy(['email' => $principal['email'], 'nom' => $principal['name'], 'prenom' => $principal['firstname']]);

                    if (!$principalCustomer instanceof Personne) {
                        $email = $principal['email'];
                        $name = $principal['name'];
                        $firstname = $principal['firstname'];
                        $price = $principal['price'];
                        $paymentMethod = $principal['order_payment_type'];

                        // Récupération de la civilite
                        $civilite = null;
                        if(isset($principal['custom']['Civilité'])) {
                            if (str_contains(strtolower($principal['custom']['Civilité']), 'mme')) {
                                $civilite = $madameCivilite;
                            } else {
                                $civilite = $monsieurCivilite;
                            }
                        } else {
                            if (str_contains(strtolower($principal['custom_order']['Civilité']), 'mme')) {
                                $civilite = $madameCivilite;
                            } else {
                                $civilite = $monsieurCivilite;
                            }
                        }

                        // Récupération du portable
                        $portable = $principal['custom']['Portable'] ?? $principal['custom_order']['Portable'];

                        $adresse = $principal['custom_order']['Adresse'];
                        $ville = $principal['custom_order']['Ville'];
                        $codePostal = $principal['custom_order']['Code postal'];

                        $principalCustomer = new Personne();
                        $principalCustomer
                            ->setCivilite($civilite)
                            ->setPrenom($firstname)
                            ->setNom($name)
                            ->setEmail($email)
                            ->setTelephone($portable)
                            ->setAdresse($adresse)
                            ->setCodePostal($codePostal)
                            ->setVille($ville)
                            ->setMontantBillet($price)
                            ->setMontantPaye($price)
                            ->setDateReglement(new \DateTime($principal['order_date']))
                            ->setMoyenPaiement($paymentMethod)
                            ->setBilletWebTicketId($ticketExtId)
                        ;

                        ++$count;
                    } else if ($principalCustomer->getBilletWebTicketId() === null) {
                        $principalCustomer->setBilletWebTicketId($ticketExtId);
                    }

                    $conjointTicketExtId = $conjoint['ext_id'];
                    $conjointCustomer = $this->em->getRepository(Personne::class)->findOneBy(['email' => $conjoint['email'], 'nom' => $conjoint['name'], 'prenom' => $conjoint['firstname']]);

                    if (!$conjointCustomer instanceof Personne) {
                        $email = $conjoint['email'];
                        $name = $conjoint['name'];
                        $firstname = $conjoint['firstname'];
                        $price = $conjoint['price'];
                        $paymentMethod = $conjoint['order_payment_type'];

                        // Récupération de la civilite
                        $civilite = null;
                        if(isset($conjoint['custom']['Civilité'])) {
                            if (str_contains(strtolower($conjoint['custom']['Civilité']), 'mme')) {
                                $civilite = $madameCivilite;
                            } else {
                                $civilite = $monsieurCivilite;
                            }
                        } else {
                            if (str_contains(strtolower($conjoint['custom_order']['Civilité']), 'mme')) {
                                $civilite = $madameCivilite;
                            } else {
                                $civilite = $monsieurCivilite;
                            }
                        }

                        // Récupération du portable
                        $portable = $conjoint['custom']['Portable'] ?? $conjoint['custom_order']['Portable'];

                        $adresse = $conjoint['custom_order']['Adresse'];
                        $ville = $conjoint['custom_order']['Ville'];
                        $codePostal = $conjoint['custom_order']['Code postal'];

                        $conjointCustomer = new Personne();
                        $conjointCustomer
                            ->setCivilite($civilite)
                            ->setPrenom($firstname)
                            ->setNom($name)
                            ->setEmail($email)
                            ->setTelephone($portable)
                            ->setAdresse($adresse)
                            ->setCodePostal($codePostal)
                            ->setVille($ville)
                            ->setMontantBillet($price)
                            ->setMontantPaye($price)
                            ->setDateReglement(new \DateTime($conjoint['order_date']))
                            ->setMoyenPaiement($paymentMethod)
                            ->setBilletWebTicketId($conjointTicketExtId)
                        ;

                        ++$count;
                    } else if ($conjointCustomer->getBilletWebTicketId() === null) {
                        $conjointCustomer->setBilletWebTicketId($conjointTicketExtId);
                    }


                    $this->em->persist($principalCustomer);
                    $this->em->persist($conjointCustomer);
                } else {
                    $principal = $customers[0];

                    $ticketExtId = $principal['ext_id'];
                    $principalCustomer = $this->em->getRepository(Personne::class)->findOneBy(['email' => $principal['email'], 'nom' => $principal['name'], 'prenom' => $principal['firstname']]);

                    if (!$principalCustomer instanceof Personne) {
                        $email = $principal['email'];
                        $name = $principal['name'];
                        $firstname = $principal['firstname'];
                        $price = $principal['price'];
                        $paymentMethod = $principal['order_payment_type'];

                        // Récupération de la civilite
                        $civilite = null;
                        if(isset($principal['custom']['Civilité'])) {
                            if (str_contains(strtolower($principal['custom']['Civilité']), 'mme')) {
                                $civilite = $madameCivilite;
                            } else {
                                $civilite = $monsieurCivilite;
                            }
                        } else {
                            if (str_contains(strtolower($principal['custom_order']['Civilité']), 'mme')) {
                                $civilite = $madameCivilite;
                            } else {
                                $civilite = $monsieurCivilite;
                            }
                        }

                        // Récupération du portable
                        $portable = $principal['custom']['Portable'] ?? $principal['custom_order']['Portable'];

                        $adresse = $principal['custom_order']['Adresse'];
                        $ville = $principal['custom_order']['Ville'];
                        $codePostal = $principal['custom_order']['Code postal'];

                        $principalCustomer = new Personne();
                        $principalCustomer
                            ->setCivilite($civilite)
                            ->setPrenom($firstname)
                            ->setNom($name)
                            ->setEmail($email)
                            ->setTelephone($portable)
                            ->setAdresse($adresse)
                            ->setCodePostal($codePostal)
                            ->setVille($ville)
                            ->setMontantBillet($price)
                            ->setMontantPaye($price)
                            ->setDateReglement(new \DateTime($principal['order_date']))
                            ->setMoyenPaiement($paymentMethod)
                            ->setBilletWebTicketId($ticketExtId)
                        ;

                        ++$count;
                    } else if ($principalCustomer->getBilletWebTicketId() === null) {
                        $principalCustomer->setBilletWebTicketId($ticketExtId);
                    }

                    $this->em->persist($principalCustomer);
                }
                $this->em->flush();
            }

//            $currentEvent->setLastUpdateBilletWeb($newLastSyncDate);
//            $this->em->persist($currentEvent);
//            $this->em->flush();

            return $this->json([
                'message' => $count.' participant(s) ont été synchronisé(s) avec billet web',
                'lastSyncDate' => $lastSyncDate instanceof \DateTime ? $lastSyncDate->format('Y-m-d H:i:s') : null,
                'newLastSyncDate' => $newLastSyncDate->format('Y-m-d H:i:s'),
            ], Response::HTTP_OK);
        } catch (\Exception|GuzzleException $e) {
            return $this->json([
                'error' => 'ERROR_SYNC_BILLET_WEB_003',
                'status' => 'error',
                'message' => 'Error while trying to sync with billet web'
            ], Response::HTTP_BAD_REQUEST);
        }
    }
}