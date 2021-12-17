<?php

namespace App\DataFixtures;

use App\Entity\CategorieTable;
use App\Entity\Table;
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
        $reserve = new CategorieTable();

        $homme->setNom('Homme')
                ->setCouleur('#235ed4');

        $femme->setNom('Femme')
                ->setCouleur('#e26de0');

        $mixte->setNom('Mixte')
                ->setCouleur('#01A451');
        $reserve->setNom('Réservé')
                ->setCouleur('#E81B2A');

        $manager->persist($homme);
        $manager->persist($femme);
        $manager->persist($mixte);

        $manager->flush();
    }
}
