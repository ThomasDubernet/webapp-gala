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

        $homme->setNom('Homme')
                ->setCouleur('#235ed4');

        $femme->setNom('Femme')
                ->setCouleur('#e26de0');

        $mixte->setNom('Mixte')
                ->setCouleur('#000000');

        $manager->persist($homme);
        $manager->persist($femme);
        $manager->persist($mixte);

        // for ($i=0; $i < 20; $i++) { 
        //         $table = new Table();
        //         $table->setNom('Homme');
        //         $table->setNumero(1);
        //         $table->setNombrePlacesMax(4);
        //         $table->setCategorie($homme);

        //         $table2 = new Table();
        //         $table2->setNom('Femme');
        //         $table2->setNumero(2);
        //         $table2->setNombrePlacesMax(8);
        //         $table2->setCategorie($femme);

        //         $table3 = new Table();
        //         $table3->setNom('Mixte');
        //         $table3->setNumero(3);
        //         $table3->setNombrePlacesMax(12);
        //         $table3->setCategorie($mixte);

        //         $manager->persist($table);
        //         $manager->persist($table2);
        //         $manager->persist($table3);
        // }

        $manager->flush();
    }
}
