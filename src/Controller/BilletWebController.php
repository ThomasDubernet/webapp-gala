<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Entity\Personne;
use Doctrine\ORM\EntityManagerInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
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

            // Créer un tableau des orderName
            $names = [];
            foreach($responseContent as $customer) {
                $orderName = $customer['order_name'];

                $names[$orderName][] = $customer;
            }

            $count = 0;

            foreach($names as $name => $customers) {
                // Trouver le client principal
                $principalCustomer = null;

                foreach($customers as $customer) {
                    if($customer['firstname'] === $customer['order_firstname']) {
                        $principalCustomer = $customer;
                        break;
                    }
                }

                if ($principalCustomer === null) {
                    $principalCustomer = $customers[0];
                }
                // On cherche le client principal si il existe
                $principal = $this->em->getRepository(Personne::class)->findOneBy(['email' => $principalCustomer['email']]);
                if(!$principal instanceof Personne) {
                    $principal = new Personne();
                    $principal
                        ->setEmail($principalCustomer['email'])
                        ->setNom($principalCustomer['name'])
                        ->setPrenom($principalCustomer['firstname'])
                        ->setMontantPaye($principalCustomer['price'])
                        ->setMontantBillet($principalCustomer['price'])
                        ->setDateReglement(new \DateTime($principalCustomer['order_date']))
                        ->setTelephone($principalCustomer['custom']['Portable'])
                        ->setAdresse($principalCustomer['custom_order']['Adresse'])
                        ->setVille($principalCustomer['custom_order']['Ville'])
                        ->setCodePostal($principalCustomer['custom_order']['Code postal'])
                    ;

                    $this->em->persist($principal);
                    ++$count;
                }

                // Trouver le conjoint
                $conjoint = null;
                foreach($customers as $customer) {
                    if($customer['firstname'] !== $customer['order_firstname']) {
                        $conjoint = $customer;
                        break;
                    }
                }

                if($conjoint) {
                    // On chercher le conjoint si il existe
                    $second = $this->em->getRepository(Personne::class)->findOneBy(['email' => $conjoint['email']]);
                    if(!$second instanceof Personne) {
                        $second = new Personne();
                        $second
                            ->setEmail($conjoint['email'])
                            ->setNom($conjoint['name'])
                            ->setPrenom($conjoint['firstname'])
                            ->setMontantPaye($conjoint['price'])
                            ->setMontantBillet($conjoint['price'])
                            ->setDateReglement(new \DateTime($conjoint['order_date']))
                            ->setTelephone($conjoint['custom']['Portable'])
                            ->setAdresse($conjoint['custom_order']['Adresse'])
                            ->setVille($conjoint['custom_order']['Ville'])
                            ->setCodePostal($conjoint['custom_order']['Code postal'])
                        ;

                        $principal->setConjoint($second);

                        $this->em->persist($second);
                        ++$count;
                    }
                }

                $this->em->flush();
            }

            $currentEvent->setLastUpdateBilletWeb($newLastSyncDate);
            $this->em->persist($currentEvent);
            $this->em->flush();

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