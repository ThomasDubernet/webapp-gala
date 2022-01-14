<?php

namespace App\Tests;

use App\Entity\User;
use PHPUnit\Framework\TestCase;

class UserUnitTest extends TestCase
{
    public function testIsTrue(): void
    {
        $user = new User();
        $user->setEmail('test@test.fr')
             ->setPassword('test');

        $this->assertTrue($user->getEmail() === 'test@test.fr');

    }

    public function testIsFalse(): void
    {
        $user = new User();
        $user->setEmail('test@test.fr')
             ->setPassword('test');

        $this->assertFalse($user->getEmail() === 'false@test.fr');
    }

    public function testIsEmpty(): void
    {
        $user = new User();

        $this->assertEmpty($user->getEmail());
        // $this->assertEmpty($user->getPassword());

    }
}
