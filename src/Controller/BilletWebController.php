<?php

namespace App\Controller;

use App\Entity\Civilite;
use App\Entity\Evenement;
use App\Entity\Personne;
use Doctrine\ORM\EntityManagerInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class BilletWebController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        #[Autowire(service: 'billetweb.http_client')] private readonly Client $httpClient,
        #[Autowire('%env(BILLET_WEB_BASIC)%')] private readonly string $billetWebToken,
        private readonly LoggerInterface $logger
    ) {}

    #[Route('/api/billet-web/sync', name: 'billet_web_sync_post', methods: ['POST'])]
    public function index(): JsonResponse
    {
        $newLastSyncDate = new \DateTime();
        $currentEvent = $this->em->getRepository(Evenement::class)->findAll()[0] ?? null;

        if ($currentEvent === null) {
            return $this->json([
                'error' => 'ERROR_SYNC_BILLET_WEB_001',
                'status' => 'error',
                'message' => 'No event found'
            ], Response::HTTP_BAD_REQUEST);
        }

        $billetWebId = $currentEvent->getBilletwebId();
        $lastSyncDate = $currentEvent->getLastUpdateBilletWeb();

        if ($billetWebId === null) {
            return $this->json([
                'error' => 'ERROR_SYNC_BILLET_WEB_002',
                'status' => 'error',
                'message' => 'No billet web id found'
            ], Response::HTTP_BAD_REQUEST);
        }

        $apiUrl = '/api/event/' . $billetWebId . '/attendees';

        if ($lastSyncDate !== null) {
            $lastSyncTimestamp = $lastSyncDate->getTimestamp();
            $apiUrl .= '?last_update=' . $lastSyncTimestamp;
        }

        try {
            $response = $this->httpClient->request('GET', $apiUrl, [
                'headers' => [
                    'Authorization' => 'Basic '.$this->billetWebToken
                ]
            ]);

            $responseContent = json_decode($response->getBody()->getContents(), true);

            if (isset($responseContent['error'])) {
                return $this->json([
                    'error' => 'ERROR_SYNC_BILLET_WEB_003 - ' . $responseContent['error'],
                    'status' => 'error',
                    'message' => $responseContent['description']
                ], Response::HTTP_BAD_REQUEST);
            }

            // Créer un tableau des commandes
            $orders = [];
            foreach ($responseContent as $customer) {
                $orderExtId = $customer['order_ext_id'];
                $orders[$orderExtId][] = $customer;
            }

            $count = 0;

            $monsieurCivilite = $this->em->getRepository(Civilite::class)->findOneBy(['nom' => 'M.']);
            $madameCivilite = $this->em->getRepository(Civilite::class)->findOneBy(['nom' => 'Mme']);

            // On parcourt les commandes - traite tous les participants
            foreach ($orders as $orderExtId => $customers) {
                foreach ($customers as $customer) {
                    $ticketExtId = $customer['ext_id'];
                    $existingPerson = $this->em->getRepository(Personne::class)->findOneBy([
                        'email' => $customer['email'],
                        'nom' => $customer['name'],
                        'prenom' => $customer['firstname']
                    ]);

                    if (!$existingPerson instanceof Personne) {
                        $person = $this->createPersonneFromBilletWebData(
                            $customer,
                            $monsieurCivilite,
                            $madameCivilite
                        );
                        ++$count;
                    } else {
                        $person = $existingPerson;
                        if ($person->getBilletWebTicketId() === null) {
                            $person->setBilletWebTicketId($ticketExtId);
                        }
                    }

                    $this->em->persist($person);
                }
                $this->em->flush();
            }

            return $this->json([
                'message' => $count . ' participant(s) ont été synchronisé(s) avec billet web',
                'lastSyncDate' => $lastSyncDate instanceof \DateTime ? $lastSyncDate->format('Y-m-d H:i:s') : null,
                'newLastSyncDate' => $newLastSyncDate->format('Y-m-d H:i:s'),
            ], Response::HTTP_OK);
        } catch (\Exception|GuzzleException $e) {
            $this->logger->error('BilletWeb sync failed', [
                'error' => $e->getMessage()
            ]);

            return $this->json([
                'error' => 'ERROR_SYNC_BILLET_WEB_003',
                'status' => 'error',
                'message' => 'Error while trying to sync with billet web'
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Détermine la civilité à partir des données BilletWeb
     */
    private function determineCivilite(array $data, Civilite $monsieur, Civilite $madame): Civilite
    {
        $civiliteStr = $data['custom']['Civilité'] ?? $data['custom_order']['Civilité'] ?? '';

        return str_contains(strtolower($civiliteStr), 'mme') ? $madame : $monsieur;
    }

    /**
     * Crée une Personne à partir des données BilletWeb
     */
    private function createPersonneFromBilletWebData(
        array $customerData,
        Civilite $monsieurCivilite,
        Civilite $madameCivilite
    ): Personne {
        $civilite = $this->determineCivilite($customerData, $monsieurCivilite, $madameCivilite);
        $portable = $customerData['custom']['Portable'] ?? $customerData['custom_order']['Portable'];

        $personne = new Personne();
        $personne
            ->setCivilite($civilite)
            ->setPrenom($customerData['firstname'])
            ->setNom($customerData['name'])
            ->setEmail($customerData['email'])
            ->setTelephone($portable)
            ->setAdresse($customerData['custom_order']['Adresse'])
            ->setCodePostal($customerData['custom_order']['Code postal'])
            ->setVille($customerData['custom_order']['Ville'])
            ->setMontantBillet($customerData['price'])
            ->setMontantPaye($customerData['price'])
            ->setDateReglement(new \DateTime($customerData['order_date']))
            ->setMoyenPaiement($customerData['order_payment_type'])
            ->setBilletWebTicketId($customerData['ext_id']);

        return $personne;
    }
}
