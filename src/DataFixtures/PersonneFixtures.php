<?php

namespace App\DataFixtures;

use App\Entity\Personne;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class PersonneFixtures extends Fixture
{

    public function load(ObjectManager $manager): void
    {
        $personne = new Personne();
        $personne->setPrenom('Thomas');
        $personne->setNom('Dubernet');
        $personne->setAdresse('3 rue jean jaures');
        $personne->setCodePostal('33810');
        $personne->setVille('Ambès');
        $personne->setTelephone('0611905949');
        $personne->setEmail('thoms.dubernet@gmail.com');

        $personne2 = new Personne();
        $personne2->setPrenom('John');
        $personne2->setNom('Doe');
        $personne2->setAdresse('2( rue de la paix');
        $personne2->setCodePostal('33000');
        $personne2->setVille('Bordeaux');
        $personne2->setTelephone('0611905949');
        $personne2->setEmail('john.doe@fixtures.com');

        $personne3 = new Personne();
        $personne3->setPrenom('Alisee');
        $personne3->setNom('Merlan');
        $personne3->setAdresse('36 rue de la foret');
        $personne3->setCodePostal('33000');
        $personne3->setVille('Bordeaux');
        $personne3->setTelephone('0611905949');
        $personne3->setEmail('thoms.dubernet@fixtures.com');

        $manager->persist($personne);
        $manager->persist($personne2);
        $manager->persist($personne3);

        $manager->flush();
    }
}
