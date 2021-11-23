<?php

namespace App\Tests;

use App\Entity\CategoriePersonne;
use PHPUnit\Framework\TestCase;

class CategoriePersonneUnitTest extends TestCase
{
    public function testIsTrue(): void
    {
        $catPersonne = new CategoriePersonne();
        $catPersonne->setNom('Cat test');

        $this->assertTrue($catPersonne->getNom() === 'Cat test');

    }

    public function testIsFalse(): void
    {
        $catPersonne = new CategoriePersonne();
        $catPersonne->setNom('Cat test');

        $this->assertFalse($catPersonne->getNom() === 'false test');
    }

    public function testIsEmpty(): void
    {
        $catPersonne = new CategoriePersonne();

        $this->assertEmpty($catPersonne->getNom());

    }
}
