<?php

namespace App\Service;

use App\Entity\Evenement;
use App\Entity\Personne;
use App\Repository\EvenementRepository;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class BilletWebService
{
    public function __construct(
        private readonly EvenementRepository $eventRepo,
        #[Autowire(service: 'billetweb.http_client')] private readonly Client $httpClient,
        #[Autowire('%env(BILLET_WEB_BASIC)%')] private readonly string $billetWebToken,
        private readonly LoggerInterface $logger
    ) {}

    public function createPerson(Personne $person): void
    {
        $currentEvent = $this->eventRepo->findAll()[0] ?? null;

        if ($currentEvent instanceof Evenement) {
            $billetWebId = $currentEvent->getBilletwebId();

            if ($billetWebId) {
                try {
                    $this->httpClient->request('POST', '/api/event/'.$billetWebId.'/add_order', [
                        'headers' => [
                            'Authorization' => 'Basic '.$this->billetWebToken
                        ],
                        'json' => [
                            'data' => [
                                [
                                    'name' => $person->getNom(),
                                    'firstname' => $person->getPrenom(),
                                    'email' => $person->getEmail(),
                                    'session' => '0',
                                    'payment_type' => 'other',
                                    'products' => [
                                        [
                                            'ticket' => 'Import Appli BR',
                                            'name' => $person->getNom(),
                                            'firstname' => $person->getPrenom(),
                                            'email' => $person->getEmail(),
                                            'price' => $person->getMontantPaye(),
                                            'used' => 0,
                                            'custom' => [
                                                'Portable' => $person->getTelephone() ? '+33'.$person->getTelephone() : null,
                                                'Adresse' => $person->getAdresse(),
                                                'Code Postal' => $person->getCodePostal(),
                                                'Ville' => $person->getVille(),
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]);
                } catch (GuzzleException $e) {
                    $this->logger->error('BilletWeb API call failed for person creation', [
                        'person_id' => $person->getId(),
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }
    }

    public function createCouple(Personne $person, Personne $conjoint): void
    {
        $currentEvent = $this->eventRepo->findAll()[0] ?? null;

        if ($currentEvent instanceof Evenement) {
            $billetWebId = $currentEvent->getBilletwebId();

            if ($billetWebId) {
                try {
                    $this->httpClient->request('POST', '/api/event/'.$billetWebId.'/add_order', [
                        'headers' => [
                            'Authorization' => 'Basic '.$this->billetWebToken
                        ],
                        'json' => [
                            'data' => [
                                [
                                    'name' => $person->getNom(),
                                    'firstname' => $person->getPrenom(),
                                    'email' => $person->getEmail(),
                                    'session' => '0',
                                    'payment_type' => 'other',
                                    'products' => [
                                        [
                                            'ticket' => 'Import Appli BR',
                                            'name' => $person->getNom(),
                                            'firstname' => $person->getPrenom(),
                                            'email' => $person->getEmail(),
                                            'price' => $person->getMontantPaye(),
                                            'used' => 0,
                                            'custom' => [
                                                'Portable' => $person->getTelephone() ? '+33'.$person->getTelephone() : null,
                                                'Adresse' => $person->getAdresse(),
                                                'Code Postal' => $person->getCodePostal(),
                                                'Ville' => $person->getVille(),
                                            ]
                                        ],
                                        [
                                            'ticket' => 'Import Appli BR',
                                            'name' => $conjoint->getNom(),
                                            'firstname' => $conjoint->getPrenom(),
                                            'email' => $conjoint->getEmail(),
                                            'price' => $conjoint->getMontantPaye(),
                                            'used' => 0,
                                            'custom' => [
                                                'Portable' => $person->getTelephone() ? '+33'.$person->getTelephone() : null,
                                                'Adresse' => $person->getAdresse(),
                                                'Code Postal' => $person->getCodePostal(),
                                                'Ville' => $person->getVille(),
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]);
                } catch (GuzzleException $e) {
                    $this->logger->error('BilletWeb API call failed for couple creation', [
                        'person_id' => $person->getId(),
                        'conjoint_id' => $conjoint->getId(),
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }
    }
}