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
              ->setBilletwebId('12345')
              ->setLastUpdateBilletWeb($datetime);

        $this->assertTrue($event->getNom() === 'Event test');
        $this->assertTrue($event->getBilletwebId() === '12345');
        $this->assertTrue($event->getLastUpdateBilletWeb() === $datetime);
    }

    public function testIsFalse(): void
    {
        $datetime1 = new DateTime('2021-11-11 12:00');
        $datetime2 = new DateTime('2021-11-11 11:00');

        $event = new Evenement();
        $event->setNom('Event test')
              ->setBilletwebId('12345')
              ->setLastUpdateBilletWeb($datetime1);

        $this->assertFalse($event->getNom() === 'false test');
        $this->assertFalse($event->getBilletwebId() === '00000');
        $this->assertFalse($event->getLastUpdateBilletWeb() === $datetime2);
    }

    public function testIsEmpty(): void
    {
        $event = new Evenement();

        $this->assertEmpty($event->getNom());
        $this->assertEmpty($event->getBilletwebId());
        $this->assertEmpty($event->getLastUpdateBilletWeb());
        $this->assertEmpty($event->getPlan());
    }
}
