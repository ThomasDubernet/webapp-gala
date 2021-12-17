<?php

namespace App\Validator\Constraints;

use App\Entity\Personne;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class dateReglementConstraintValidator extends ConstraintValidator
{
    public function validate($value, Constraint $constraint)
    {
        $object = $this->context->getObject();

        if ($object instanceof Personne) {
            if ($value == null) {
                if ($object->getMontantPaye() !== null) {
                    return $this->context
                        ->buildViolation($constraint->message)
                        ->addViolation();
                }
            }
        }

        return;
    }
}
