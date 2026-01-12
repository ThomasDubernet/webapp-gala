<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Put;
use App\Repository\EvenementRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: EvenementRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['admin']],
    operations: [
        new GetCollection(),
        new Get(),
        new Put()
    ]
)]
class Evenement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['admin'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['admin'])]
    private ?string $nom = null;

    #[ORM\OneToOne(targetEntity: MediaObject::class, cascade: ['persist', 'remove'], fetch: 'EAGER')]
    #[Groups(['admin'])]
    private ?MediaObject $plan = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['admin'])]
    private ?string $billetwebId = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    #[Groups(['admin'])]
    private ?\DateTimeInterface $lastUpdateBilletWeb = null;

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

    public function getPlan(): ?MediaObject
    {
        return $this->plan;
    }

    public function setPlan(?MediaObject $plan): self
    {
        $this->plan = $plan;

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
