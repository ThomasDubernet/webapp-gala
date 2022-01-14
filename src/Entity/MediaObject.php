<?php

namespace App\Entity;

use App\Controller\MediaObjectController;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Vich\UploaderBundle\Mapping\Annotation as Vich;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity
 * @Vich\Uploadable
 */
class MediaObject
{
    /**
     * @var int|null
     *
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     * @ORM\Id
     * @Groups({"admin"})
     */
    private $id;

    /**
     * @var string|null
     *
     */
    public $contentUrl;

    /**
     * @var File|null
     *
     * @Vich\UploadableField(mapping="media_object", fileNameProperty="filePath")
     */
    public $file;

    /**
     * @var string|null
     *
     * @ORM\Column(nullable=true)
     * @Groups({"admin"})
     */
    public $filePath;

    public function getId(): ?int
    {
        return $this->id;
    }
}
