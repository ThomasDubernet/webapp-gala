<?php

namespace App\Entity;

use App\Repository\TableRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Core\Annotation\ApiResource;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity(repositoryClass=TableRepository::class)
 * @ApiResource(
 *  normalizationContext={"groups"={"admin", "table"}},
 *  collectionOperations={"get"},
 *  itemOperations={"get", "put", "delete"}
 * )
 * @ORM\Table(name="`table`")
 */
class Table
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     * @Groups({"table", "personne"})
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups({"table", "personne"})
     */
    private $nom;

    /**
     * @ORM\Column(type="integer")
     * @Groups({"table", "personne"})
     */
    private $numero;

    /**
     * @ORM\Column(type="integer")
     * @Groups({"table", "personne"})
     */
    private $nombrePlacesMax;

    /**
     * @ORM\ManyToOne(targetEntity=CategorieTable::class)
     * @Groups({"table", "personne"})
     */
    private $categorie;

    /**
     * @ORM\OneToMany(targetEntity=Personne::class, mappedBy="table", fetch="EAGER")
     * @Groups({"table"})
     */
    private $personnes;

    /**
     * @ORM\Column(type="decimal", precision=6, scale=2, nullable=true)
     * @Groups({"table", "personne"})
     */
    private $posX;

    /**
     * @ORM\Column(type="decimal", precision=6, scale=2, nullable=true)
     * @Groups({"table", "personne"})
     */
    private $posY;

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
     * @return Collection|Personne[]
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
}
