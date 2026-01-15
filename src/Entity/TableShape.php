<?php

namespace App\Entity;

/**
 * Enum representing the shape of a table in the seating plan.
 */
enum TableShape: string
{
    case Circle = 'circle';
    case Oval = 'oval';
    case Rectangle = 'rectangle';
    case RoundedRectangle = 'rounded-rectangle';
}
