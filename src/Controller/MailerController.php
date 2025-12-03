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
use Symfony\Component\Routing\Attribute\Route;

class MailerController extends AbstractController
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly EntityManagerInterface $em
    ) {}

    #[Route('/email/{id}')]
    public function sendTicket(Personne $personne): Response
    {
        $destinataire = $personne->getEmail();
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
        $personne->setMailEnvoye(true);
        $this->em->persist($personne);
        $this->em->flush();

        return $this->redirectToRoute('home');
    }
}
