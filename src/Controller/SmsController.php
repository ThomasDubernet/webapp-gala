<?php

namespace App\Controller;

use Exception;
use Ovh\Api;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class SmsController extends AbstractController
{
    public function __construct(
        private ?LoggerInterface $logger = null
    ) {}

    public function __invoke(Request $request): void
    {
        $personne = $request->get('data');
        $numero_table = $personne->getTable()->getNumero();
        $telephone = $personne->getTelephone();
        $this->sendSms($numero_table, $telephone);
    }

    #[Route('/sendsms', name: 'send_sms')]
    public function sendSms($numero_table, $telephone): void
    {
        $smsService = null;

        $smsApi = new Api(
            $_ENV['OVH_APP_KEY'],
            $_ENV['OVH_APP_SECRET'],
            'ovh-eu',
            $_ENV['OVH_CONSUMER_KEY']
        );

        // On trouve le service SMS
        try {
            $smsServices = $smsApi->get('/sms');

            foreach ($smsServices as $value) {
                if (str_contains($value, "-3")) {
                    $smsService = $value;
                }
            }
        } catch (Exception $e) {
            $this->logger?->error('SMS API error: ' . $e->getMessage());
            return;
        }

        if($smsService !== null) {
            $formattedNumber = "";
            if (str_contains($telephone, "+33")) {
                $formattedNumber = $telephone;
            } else if (str_starts_with($telephone, "0")) {
                $formattedNumber = "+33" . substr($telephone, 1);
            } else {
                $formattedNumber = "+33" . $telephone;
            }

//            $content = (object) array(
//                "charset"=> "UTF-8",
//                "class"=> "phoneDisplay",
//                "coding"=> "7bit",
//                "message"=> "Bienvenue au Gala des Institutions Beth Rivkah. Vous êtes à la table $numero_table. Bonne soirée",
//                "noStopClause"=> false,
//                "priority"=> "high",
//                "receivers"=> [ $formattedNumber ],
//                "senderForResponse"=> true,
//                "validityPeriod"=> 2880
//            );

            $content = (object) array(
                "charset"=> "UTF-8",
                "class"=> "phoneDisplay",
                "coding"=> "7bit",
                "message"=> "Bienvenue au Gala des Institutions Beth Rivkah. Vous êtes à la table $numero_table. Bonne soirée",
                "noStopClause"=> false,
                "priority"=> "high",
                "receivers"=> [ $formattedNumber ],
                "senderForResponse"=> true,
                "validityPeriod"=> 2880
            );

            try {
                $resultPostJob = $smsApi->post('/sms/' . $smsService . '/jobs', $content);
                $smsJobs = $smsApi->get('/sms/' . $smsService . '/jobs');
            } catch (Exception $e) {
                $this->logger?->error('SMS sending error: ' . $e->getMessage());
            }
        }
    }
}