<?php

namespace App\Service;

use App\Entity\Evenement;
use App\Entity\Personne;
use App\Repository\EvenementRepository;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class BilletWebService
{
    public const BILLET_WEB_API_URL = 'https://www.billetweb.fr';

    private $eventRepo;
    public function __construct(EvenementRepository $eventRepo)
    {
        $this->eventRepo = $eventRepo;
    }

    public function createPerson(Personne $person): void
    {
        $currentEvent = $this->eventRepo->findAll()[0] ?? null;

        if ($currentEvent instanceof Evenement) {
            $billetWebId = $currentEvent->getBilletwebId();

            if ($billetWebId) {
                try {
                    $httpClient = new Client([
                        'base_uri' => self::BILLET_WEB_API_URL,
                    ]);
                    $httpClient->request('POST', '/api/event/'.$billetWebId.'/add_order', [
                        'headers' => [
                            'Authorization' => "Basic ".$_ENV['BILLET_WEB_BASIC']
                        ],
                        'json' => [
                            'data' => [
                                [
                                    'name' => $person->getNom(),
                                    'firstname' => $person->getPrenom(),
                                    'email' => $person->getEmail(),
                                    'session' => '0', // TODO check à quoi ça correspond
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
                                                'Portable' => '+33'.$person->getTelephone(),
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
                    // TODO : log
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
                    $httpClient = new Client([
                        'base_uri' => self::BILLET_WEB_API_URL,
                    ]);
                    $httpClient->request('POST', '/api/event/'.$billetWebId.'/add_order', [
                        'headers' => [
                            'Authorization' => "Basic ".$_ENV['BILLET_WEB_BASIC']
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
                                                'Portable' => '+33'.$person->getTelephone(),
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
                                                'Portable' => '+33'.$person->getTelephone(),
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
                    // TODO : log
                }
            }
        }
    }
}