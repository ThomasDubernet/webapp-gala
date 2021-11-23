<?php

namespace App\Tests;

use App\Entity\Personne;
use DateTime;
use PHPUnit\Framework\TestCase;

class PersonneUnitTest extends TestCase
{
    public function testIsTrue(): void
    {
        $datetime = new DateTime('2021-11-11');

        $personne = new Personne();
        $personne->setNom('Doe')
                 ->setPrenom('John')
                 ->setAdresse('adresse')
                 ->setTelephone('0606060606')
                 ->setEmail('email@test.fr')
                 ->setMontantBillet(33.33)
                 ->setMontantPaye(33.33)
                 ->setDateReglement($datetime)
                 ->setMoyenPaiement('cheque');

        $this->assertTrue($personne->getNom() === 'Doe');
        $this->assertTrue($personne->getPrenom() === 'John');
        $this->assertTrue($personne->getAdresse() === 'adresse');
        $this->assertTrue($personne->getTelephone() === '0606060606');
        $this->assertTrue($personne->getEmail() === 'email@test.fr');
        $this->assertTrue(floatval($personne->getMontantBillet()) === 33.33);
        $this->assertTrue(floatval($personne->getMontantPaye()) === 33.33);
        $this->assertTrue($personne->getDateReglement() === $datetime);
        $this->assertTrue($personne->getMoyenPaiement() === 'cheque');

    }

    public function testIsFalse(): void
    {
        $datetime1 = new DateTime('2021-11-11');
        $datetime2 = new DateTime('2021-11-13');

        $personne = new Personne();
        $personne->setNom('Doe')
                 ->setPrenom('John')
                 ->setAdresse('adresse')
                 ->setTelephone('0606060606')
                 ->setEmail('email@test.fr')
                 ->setMontantBillet(33.33)
                 ->setMontantPaye(33.33)
                 ->setDateReglement($datetime1)
                 ->setMoyenPaiement('cheque');

        $this->assertFalse($personne->getNom() === 'False');
        $this->assertFalse($personne->getPrenom() === 'false');
        $this->assertFalse($personne->getAdresse() === 'false');
        $this->assertFalse($personne->getTelephone() === 'false');
        $this->assertFalse($personne->getEmail() === 'false@test.fr');
        $this->assertFalse($personne->getMontantBillet() === 33);
        $this->assertFalse($personne->getMontantPaye() === 33);
        $this->assertFalse($personne->getDateReglement() === $datetime2);
        $this->assertFalse($personne->getMoyenPaiement() === 'espece');
    }

    public function testIsEmpty(): void
    {
        $personne = new Personne();

        $this->assertEmpty($personne->getNom());
        $this->assertEmpty($personne->getPrenom());
        $this->assertEmpty($personne->getAdresse());
        $this->assertEmpty($personne->getTelephone());
        $this->assertEmpty($personne->getEmail());
        $this->assertEmpty($personne->getMontantBillet());
        $this->assertEmpty($personne->getMontantPaye());
        $this->assertEmpty($personne->getDateReglement());
        $this->assertEmpty($personne->getMoyenPaiement());

    }
}
