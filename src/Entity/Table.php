<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\TableRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: TableRepository::class)]
#[ORM\Table(name: '`table`')]
#[ApiResource(
    normalizationContext: ['groups' => ['admin', 'table']],
    operations: [
        new GetCollection(),
        new Get(),
        new Post(),
        new Put(),
        new Patch(),
        new Delete()
    ]
)]
class Table
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['table', 'personne'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['table', 'personne'])]
    private ?string $nom = null;

    #[ORM\Column(type: 'integer')]
    #[Groups(['table', 'personne'])]
    private ?int $numero = null;

    #[ORM\Column(type: 'integer')]
    #[Groups(['table', 'personne'])]
    private ?int $nombrePlacesMax = null;

    #[ORM\ManyToOne(targetEntity: CategorieTable::class)]
    #[Groups(['table', 'personne'])]
    private ?CategorieTable $categorie = null;

    #[ORM\OneToMany(targetEntity: Personne::class, mappedBy: 'table', fetch: 'EAGER')]
    #[Groups(['table'])]
    private Collection $personnes;

    #[ORM\Column(type: 'decimal', precision: 6, scale: 2, nullable: true)]
    #[Groups(['table', 'personne'])]
    private ?string $posX = null;

    #[ORM\Column(type: 'decimal', precision: 6, scale: 2, nullable: true)]
    #[Groups(['table', 'personne'])]
    private ?string $posY = null;

    #[ORM\Column(type: 'string', length: 20, enumType: TableShape::class)]
    #[Groups(['table', 'personne'])]
    private TableShape $shape = TableShape::Circle;

    #[ORM\Column(type: 'decimal', precision: 6, scale: 2)]
    #[Groups(['table', 'personne'])]
    private string $width = '7.76';

    #[ORM\Column(type: 'decimal', precision: 6, scale: 2)]
    #[Groups(['table', 'personne'])]
    private string $height = '7.76';

    #[ORM\Column(type: 'decimal', precision: 5, scale: 2)]
    #[Groups(['table', 'personne'])]
    private string $rotation = '0';

    public function __construct()
    {
        $this->personnes = new ArrayCollection();
    }

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

    public function getNumero(): ?int
    {
        return $this->numero;
    }

    public function setNumero(int $numero): self
    {
        $this->numero = $numero;

        return $this;
    }

    public function getNombrePlacesMax(): ?int
    {
        return $this->nombrePlacesMax;
    }

    public function setNombrePlacesMax(int $nombrePlacesMax): self
    {
        $this->nombrePlacesMax = $nombrePlacesMax;

        return $this;
    }

    public function getCategorie(): ?CategorieTable
    {
        return $this->categorie;
    }

    public function setCategorie(?CategorieTable $categorie): self
    {
        $this->categorie = $categorie;

        return $this;
    }

    /**
     * @return Collection<int, Personne>
     */
    public function getPersonnes(): Collection
    {
        return $this->personnes;
    }

    public function addPersonne(Personne $personne): self
    {
        if (!$this->personnes->contains($personne)) {
            $this->personnes[] = $personne;
            $personne->setTable($this);
        }

        return $this;
    }

    public function removePersonne(Personne $personne): self
    {
        if ($this->personnes->removeElement($personne)) {
            // set the owning side to null (unless already changed)
            if ($personne->getTable() === $this) {
                $personne->setTable(null);
            }
        }

        return $this;
    }

    public function getPosX(): ?string
    {
        return $this->posX;
    }

    public function setPosX(?string $posX): self
    {
        $this->posX = $posX;

        return $this;
    }

    public function getPosY(): ?string
    {
        return $this->posY;
    }

    public function setPosY(?string $posY): self
    {
        $this->posY = $posY;

        return $this;
    }

    public function getShape(): TableShape
    {
        return $this->shape;
    }

    public function setShape(TableShape $shape): self
    {
        $this->shape = $shape;

        return $this;
    }

    public function getWidth(): string
    {
        return $this->width;
    }

    public function setWidth(string $width): self
    {
        $this->width = $width;

        return $this;
    }

    public function getHeight(): string
    {
        return $this->height;
    }

    public function setHeight(string $height): self
    {
        $this->height = $height;

        return $this;
    }

    public function getRotation(): string
    {
        return $this->rotation;
    }

    public function setRotation(string $rotation): self
    {
        $this->rotation = $rotation;

        return $this;
    }
}
