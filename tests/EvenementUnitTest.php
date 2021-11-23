<?php

namespace App\Tests;

use App\Entity\Evenement;
use DateTime;
use PHPUnit\Framework\TestCase;

class EvenementUnitTest extends TestCase
{
    public function testIsTrue(): void
    {
        $datetime = new DateTime('2021-11-11 12:00');

        $event = new Evenement();
        $event->setNom('Event test')
              ->setNomSalle('salle')
              ->setDate($datetime)
              ->setAdresse('adresse');

        $this->assertTrue($event->getNom() === 'Event test');
        $this->assertTrue($event->getNomSalle() === 'salle');
        $this->assertTrue($event->getDate() === $datetime);
        $this->assertTrue($event->getAdresse() === 'adresse');

    }

    public function testIsFalse(): void
    {
        $datetime1 = new DateTime('2021-11-11 12:00');
        $datetime2 = new DateTime('2021-11-11 11:00');

        $event = new Evenement();
        $event->setNom('Event test')
              ->setNomSalle('salle')
              ->setDate($datetime1)
              ->setAdresse('adresse');

        $this->assertFalse($event->getNom() === 'false test');
        $this->assertFalse($event->getNomSalle() === 'false');
        $this->assertFalse($event->getDate() === $datetime2);
        $this->assertFalse($event->getAdresse() === 'false');
    }

    public function testIsEmpty(): void
    {
        $event = new Evenement();

        $this->assertEmpty($event->getNom());
        $this->assertEmpty($event->getNomSalle());
        $this->assertEmpty($event->getDate());
        $this->assertEmpty($event->getAdresse());

    }
}
