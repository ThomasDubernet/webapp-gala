<?php

namespace App\Validator\Constraints;

use Attribute;
use Symfony\Component\Validator\Constraint;

#[Attribute(Attribute::TARGET_PROPERTY | Attribute::TARGET_METHOD)]
class dateReglementConstraint extends Constraint
{
    public string $message = "La date de ne peut pas être vide";

    public function validatedBy(): string
    {
        return static::class . 'Validator';
    }
}
