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
        $cat = new CategoriePersonne();
        $cat1 = new CategoriePersonne();
        $cat2 = new CategoriePersonne();
        $cat3 = new CategoriePersonne();
        $cat4 = new CategoriePersonne();
        $cat5 = new CategoriePersonne();

        $cat->setNom('Général ');
        $cat1->setNom('Parents d\'élèves');
        $cat2->setNom('Anciens élèves');
        $cat3->setNom('Personnel');
        $cat4->setNom('Staff');
        $cat5->setNom('Invité');

        $manager->persist($cat);
        $manager->persist($cat1);
        $manager->persist($cat2);
        $manager->persist($cat3);
        $manager->persist($cat4);
        $manager->persist($cat5);

        $manager->flush();
    }
}
