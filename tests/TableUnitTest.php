<?php

namespace App\Tests;

use App\Entity\Table;
use PHPUnit\Framework\TestCase;

class TableUnitTest extends TestCase
{
    public function testIsTrue(): void
    {
        $table = new Table();
        $table->setNom('Table test')
              ->setNumero(3)
              ->setNombrePlacesMax(10);

        $this->assertTrue($table->getNom() === 'Table test');
        $this->assertTrue($table->getNumero() === 3);
        $this->assertTrue($table->getNombrePlacesMax() === 10);

    }

    public function testIsFalse(): void
    {
        $table = new Table();
        $table->setNom('Table test')
              ->setNumero(3)
              ->setNombrePlacesMax(10);

        $this->assertFalse($table->getNom() === 'false test');
        $this->assertFalse($table->getNumero() === 0);
        $this->assertFalse($table->getNombrePlacesMax() === 9);
    }

    public function testIsEmpty(): void
    {
        $table = new Table();

        $this->assertEmpty($table->getNom());
        $this->assertEmpty($table->getNumero());
        $this->assertEmpty($table->getNombrePlacesMax());

    }
}
