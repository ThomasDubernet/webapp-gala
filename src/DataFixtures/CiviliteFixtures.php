<?php

namespace App\DataFixtures;

use App\Entity\Civilite;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class CiviliteFixtures extends Fixture
{

    public function load(ObjectManager $manager): void
    {
        $civilite = new Civilite();
        $civilite->setNom('M.');
        
        $civilite1 = new Civilite();
        $civilite1->setNom('Mme');

        $civilite2 = new Civilite();
        $civilite2->setNom('Mlle');

        $manager->persist($civilite);
        $manager->persist($civilite1);
        $manager->persist($civilite2);

        $manager->flush();
    }
}
