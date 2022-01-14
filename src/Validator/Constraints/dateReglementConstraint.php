<?php

namespace App\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class dateReglementConstraint extends Constraint
{
    public string $message = "La date de ne peut pas être vide";

    /**
     * @return string
     */
    public function validatedBy(): string
    {
        return \get_class($this) . 'Validator';
    }
}
