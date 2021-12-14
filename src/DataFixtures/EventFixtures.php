<?php

namespace App\DataFixtures;

use App\Entity\Evenement;
use DateTime;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class EventFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $event = new Evenement();

        // $event->setNom('event')
        //         ->setNomSalle('Salle event')
        //         ->setDate(new DateTime())
        //         ->setAdresse('Placde de la victoire, 33000 Bordeaux');


        $manager->persist($event);

        $manager->flush();
    }
}
