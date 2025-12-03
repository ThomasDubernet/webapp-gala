<?php

namespace App\Validator\Constraints;

use Attribute;
use Symfony\Component\Validator\Constraint;

#[Attribute(Attribute::TARGET_PROPERTY | Attribute::TARGET_METHOD)]
class moyenReglementConstraint extends Constraint
{
    public string $message = "Le moyen de paiement ne peut pas être vide";

    public function validatedBy(): string
    {
        return static::class . 'Validator';
    }
}
