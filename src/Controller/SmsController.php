<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use \Ovh\Api;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class SmsController extends AbstractController
{
    public function __invoke(Request $request)
    {
        $personne = $request->get('data');
        $numero_table = $personne->getTable()->getNumero();
        $telephone = $personne->getTelephone();
        $this->sendSms($numero_table, $telephone);
    }

    /**
     * @Route("/sendsms", name="send_sms")
     */
    public function sendSms($numero_table, $telephone): void
    {
        $smsApi = new Api(
            $_ENV['OVH_APP_KEY'],
            $_ENV['OVH_APP_SECRET'],
            'ovh-eu',
            $_ENV['OVH_CONSUMER_KEY']
        );
        $number = substr($telephone, 1);

        $smsServices = $smsApi->get('/sms');
        $service = "";

        foreach ($smsServices as $value) {
           if (str_contains($value, "-3")) {
               $service = $value;
           }
        }

        $content = (object) array(
            "charset"=> "UTF-8",
            "class"=> "phoneDisplay",
            "coding"=> "7bit",
            "message"=> "Bienvenue au Gala des Institutions Beth Rivkah. Vous êtes à la table $numero_table. Bonne soirée",
            "noStopClause"=> false,
            "priority"=> "high",
            "receivers"=> [ "+33$number" ],
            "senderForResponse"=> true,
            "validityPeriod"=> 2880
        );

        $resultPostJob = $smsApi->post('/sms/' . $service . '/jobs', $content);
        $smsJobs = $smsApi->get('/sms/' . $service . '/jobs');

        return;
    }
}