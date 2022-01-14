<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Entity\Personne;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Routing\Annotation\Route;

class MailerController extends AbstractController
{
    /**
     * @var MailerInterface
     */
    private $mailer;

    /**
     * @var EntityManagerInterface
     */
    private $em;

    public function __construct(MailerInterface $mailer, EntityManagerInterface $em)
    {
        $this->mailer = $mailer;
        $this->em = $em;
    }

    /**
     * @Route("/email/{id}")
     */
    public function sendTicket(Personne $personne)
    {
       $destinataire  = $personne->getEmail();
       $uploadDir = $this->getParameter('kernel.project_dir') . '/public' . $this->getParameter('upload_directory');
       $file = $personne->getTicket()->getFichier();

       $events = $this->em->getRepository(Evenement::class)->findAll();
       $event = $events[0];

       $message = (new TemplatedEmail())
        ->from(new Address($_ENV['APP_EMAIL'], 'Reservation Bethrivkah'))
        ->to($destinataire)
        ->subject('Billet de reservation')
        ->htmlTemplate('emails/ticket.html.twig')
        ->context([
            'text_content' => $event->getTextEmail()
        ])
        ->attachFromPath($uploadDir . "/" . $file);

        $this->mailer->send($message);
        return $this->redirectToRoute('home');
    }
}