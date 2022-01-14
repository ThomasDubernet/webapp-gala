<?php

namespace App\Entity;

use App\Repository\CategorieTableRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity(repositoryClass=CategorieTableRepository::class)
 */
class CategorieTable
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     * @Groups({"table"})
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     * @Groups({"table"})
     */
    private $nom;

    /**
     * @ORM\Column(type="string", length=255)
     * @Groups({"table"})
     */
    private $couleur;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): self
    {
        $this->nom = $nom;

        return $this;
    }

    public function getCouleur(): ?string
    {
        return $this->couleur;
    }

    public function setCouleur(string $couleur): self
    {
        $this->couleur = $couleur;

        return $this;
    }
}
