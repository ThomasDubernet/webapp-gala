<?php

namespace App\Tests;

use App\Entity\CategorieTable;
use PHPUnit\Framework\TestCase;

class CategorieTableUnitTest extends TestCase
{
    public function testIsTrue(): void
    {
        $catTable = new CategorieTable();
        $catTable->setNom('Cat test')
                 ->setCouleur('#FFFFFF');

        $this->assertTrue($catTable->getNom() === 'Cat test');
        $this->assertTrue($catTable->getCouleur() === '#FFFFFF');

    }

    public function testIsFalse(): void
    {
        $catTable = new CategorieTable();
        $catTable->setNom('Cat test')
                 ->setCouleur('#FFFFFF');

        $this->assertFalse($catTable->getNom() === 'false test');
        $this->assertFalse($catTable->getCouleur() === '#000000');
    }

    public function testIsEmpty(): void
    {
        $catTable = new CategorieTable();

        $this->assertEmpty($catTable->getNom());
        $this->assertEmpty($catTable->getCouleur());

    }
}
