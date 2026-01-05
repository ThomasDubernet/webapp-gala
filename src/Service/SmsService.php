<?php

namespace App\Service;

use App\Entity\Personne;
use App\Entity\Table;
use Doctrine\ORM\EntityManagerInterface;
use Ovh\Api;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class SmsService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        #[Autowire(service: 'ovh.sms_api')] private readonly Api $smsApi,
        private readonly LoggerInterface $logger
    ) {}

    public function sendSms(Personne $personne): void
    {
        $table = $personne->getTable();
        $phone = $personne->getTelephone();

        if ($table instanceof Table && $phone) {
            try {
                $smsServiceIds = $this->smsApi->get('/sms');
                $selectedSmsServiceId = null;

                foreach ($smsServiceIds as $value) {
                    if (str_contains($value, '-3')) {
                        $selectedSmsServiceId = $value;
                    }
                }

                if ($selectedSmsServiceId) {
                    if (str_contains($phone, '+33')) {
                        $formattedNumber = $phone;
                    } elseif (str_starts_with($phone, '0')) {
                        $formattedNumber = '+33'.substr($phone, 1);
                    } else {
                        $formattedNumber = '+33'.$phone;
                    }

                    $tableNumber = $table->getNumero();

                    $this->smsApi->post("/sms/$selectedSmsServiceId/jobs", [
                        'charset' => 'UTF-8',
                        'coding' => '7bit',
                        'differedPeriod' => 0,
                        'message' => "Bienvenue à notre Gala. Vous êtes à la table $tableNumber. Bonne soirée",
                        'noStopClause' => true,
                        'priority' => 'high',
                        'receivers' => [$formattedNumber],
                        'sender' => 'Beth Rivkah',
                    ]);

                    $personne->setSmsSended(true);

                    $this->em->persist($personne);
                    $this->em->flush();
                }
            } catch (\Exception $e) {
                $this->logger->error('SMS sending failed', [
                    'personne_id' => $personne->getId(),
                    'phone' => $personne->getTelephone(),
                    'error' => $e->getMessage()
                ]);
            }
        }
    }
}