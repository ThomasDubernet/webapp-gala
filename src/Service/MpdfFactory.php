<?php

namespace App\Service;

use Mpdf\Mpdf;

class MpdfFactory
{
    public function createMpdfObject(array $config = []): Mpdf
    {
        return new Mpdf($config);
    }
}
