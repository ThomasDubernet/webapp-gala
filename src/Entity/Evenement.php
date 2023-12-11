<?php

namespace App\Entity;

use App\Repository\EvenementRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Core\Annotation\ApiResource;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity(repositoryClass=EvenementRepository::class)
 * @ApiResource(
 *  collectionOperations={"get"}
 * )
 */
class Evenement
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     * @Groups({"admin"})
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups({"admin"})
     */
    private $nom;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups({"admin"})
     */
    private $nomSalle;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     * @Groups({"admin"})
     */
    private $date;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups({"admin"})
     */
    private $adresse;

    /**
     * @ORM\OneToOne(targetEntity=MediaObject::class, cascade={"persist", "remove"}, fetch="EAGER")
     * @Groups({"admin"})
     */
    private $plan;

    /**
     * @ORM\OneToOne(targetEntity=MediaObject::class, cascade={"persist", "remove"}, fetch="EAGER")
     * @Groups({"admin"})
     */
    private $imageTicket;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $codePostal;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $ville;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $textEmail;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $billetwebId;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $lastUpdateBilletWeb;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(?string $nom): self
    {
        $this->nom = $nom;

        return $this;
    }

    public function getNomSalle(): ?string
    {
        return $this->nomSalle;
    }

    public function setNomSalle(?string $nomSalle): self
    {
        $this->nomSalle = $nomSalle;

        return $this;
    }

    public function getDate(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(?\DateTimeInterface $date): self
    {
        $this->date = $date;

        return $this;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function setAdresse(?string $adresse): self
    {
        $this->adresse = $adresse;

        return $this;
    }

    public function getPlan(): ?MediaObject
    {
        return $this->plan;
    }

    public function setPlan(?MediaObject $plan): self
    {
        $this->plan = $plan;

        return $this;
    }

    public function getImageTicket(): ?MediaObject
    {
        return $this->imageTicket;
    }

    public function setImageTicket(?MediaObject $imageTicket): self
    {
        $this->imageTicket = $imageTicket;

        return $this;
    }

    public function getCodePostal(): ?string
    {
        return $this->codePostal;
    }

    public function setCodePostal(?string $codePostal): self
    {
        $this->codePostal = $codePostal;

        return $this;
    }

    public function getVille(): ?string
    {
        return $this->ville;
    }

    public function setVille(?string $ville): self
    {
        $this->ville = $ville;

        return $this;
    }

    public function getTextEmail(): ?string
    {
        return $this->textEmail;
    }

    public function setTextEmail(?string $textEmail): self
    {
        $this->textEmail = $textEmail;

        return $this;
    }

    public function getBilletwebId(): ?string
    {
        return $this->billetwebId;
    }

    public function setBilletwebId(?string $billetwebId): self
    {
        $this->billetwebId = $billetwebId;

        return $this;
    }

    public function getLastUpdateBilletWeb(): ?\DateTimeInterface
    {
        return $this->lastUpdateBilletWeb;
    }

    public function setLastUpdateBilletWeb(?\DateTimeInterface $lastUpdateBilletWeb): self
    {
        $this->lastUpdateBilletWeb = $lastUpdateBilletWeb;

        return $this;
    }
}
