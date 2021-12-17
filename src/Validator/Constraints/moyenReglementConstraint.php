<?php

namespace App\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class moyenReglementConstraint extends Constraint
{
    public string $message = "Le moyen de paiement ne peut pas être vide";

    /**
     * @return string
     */
    public function validatedBy(): string
    {
        return \get_class($this) . 'Validator';
    }
}
