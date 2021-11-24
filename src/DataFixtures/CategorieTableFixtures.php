<?php

namespace App\DataFixtures;

use App\Entity\CategorieTable;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class CategorieTableFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $homme = new CategorieTable();
        $femme = new CategorieTable();
        $mixte = new CategorieTable();

        $homme->setNom('homme')
              ->setCouleur('#235ed4');

        $femme->setNom('femme')
              ->setCouleur('#e26de0');

        $mixte->setNom('mixte')
              ->setCouleur('#000000');


        $manager->persist($homme);
        $manager->persist($femme);
        $manager->persist($mixte);

        $manager->flush();
    }
}
