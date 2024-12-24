<?php

namespace App\Service;

use App\Entity\Personne;
use App\Entity\Table;
use Doctrine\ORM\EntityManagerInterface;
use Ovh\Api;

class SmsService {
    private $em;
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function sendSms(Personne $personne): void
    {
        $table = $personne->getTable();
        $phone = $personne->getTelephone();

        if ($table instanceof Table && $phone ) {
            try {
                $smsApi = new Api(
                    $_ENV['OVH_APP_KEY'],
                    $_ENV['OVH_APP_SECRET'],
                    'ovh-eu',
                    $_ENV['OVH_CONSUMER_KEY']
                );

                $smsServiceIds = $smsApi->get('/sms');
                $selectedSmsServiceId = null;

                foreach ($smsServiceIds as $value) {
                    if (str_contains($value, "-3")) {
                        $selectedSmsServiceId = $value;
                    }
                }

                if ($selectedSmsServiceId) {
                    if (str_contains($phone, "+33")) {
                        $formattedNumber = $phone;
                    } else if (str_starts_with($phone, "0")) {
                        $formattedNumber = "+33" . substr($phone, 1);
                    } else {
                        $formattedNumber = "+33" . $phone;
                    }

                    $tableNumber = $table->getNumero();

                    $smsApi->post("/sms/$selectedSmsServiceId/jobs", array(
                        "charset" => "UTF-8", // The sms coding (type: sms.CharsetEnum, nullable)
                        "coding" => "7bit", // Deprecated: the coding is deduced from the message and its charset (type: sms.CodingEnum, nullable)
                        "differedPeriod" => 0, // The time -in minute(s)- to wait before sending the message (type: long, nullable)
                        "message" => "Bienvenue à notre Gala. Vous êtes à la table $tableNumber. Bonne soirée", // The sms message (type: string)
                        "noStopClause" => true, // Do not display STOP clause in the message, this requires that this is not an advertising message (type: boolean, nullable)
                        "priority" => "high", // The priority of the message (type: sms.PriorityEnum, nullable)
                        "receivers" => [ $formattedNumber ], // The receivers list (type: string[], nullable)
                        "sender" => "Beth Rivkah", // The sender (type: string, nullable)
                    ));

                    $personne->setSmsSended(true);

                    $this->em->persist($personne);
                    $this->em->flush();

                }
            } catch (\Exception $e) {
            }
        }
    }
}