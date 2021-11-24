<?php

namespace App\DataFixtures;

use App\Entity\CategoriePersonne;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class CategoriePersonneFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $cat1 = new CategoriePersonne();
        $cat2 = new CategoriePersonne();
        $mixte = new CategoriePersonne();

        $cat1->setNom('Parents d\'élèves');

        $cat2->setNom('Anciens élèves');

        $manager->persist($cat1);
        $manager->persist($cat2);

        $manager->flush();
    }
}
