<?php

namespace App\Service;

class UtilsService
{
    static function capitalizeFirstLetters(string $string): string
    {
        $string = mb_strtolower($string, 'UTF-8');
        return mb_convert_case($string, MB_CASE_TITLE, 'UTF-8');
    }

    static function formatEmail(string $email): string
    {
        return strtolower($email);
    }
}