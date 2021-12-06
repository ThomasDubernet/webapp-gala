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
 *  normalizationContext={"groups"={"admin"}},
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
     * @Groups({"admin"})
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     * @Groups({"admin"})
     */
    private $nom;

    /**
     * @ORM\Column(type="integer")
     * @Groups({"admin"})
     */
    private $numero;

    /**
     * @ORM\Column(type="integer")
     * @Groups({"admin"})
     */
    private $nombrePlacesMax;

    /**
     * @ORM\ManyToOne(targetEntity=CategorieTable::class)
     * @Groups({"admin"})
     */
    private $categorie;

    /**
     * @ORM\OneToMany(targetEntity=Personne::class, mappedBy="table", fetch="EAGER")
     * @Groups({"admin"})
     */
    private $personnes;

    /**
     * @ORM\Column(type="integer", nullable=true)
     * @Groups({"admin"})
     */
    private $posX;

    /**
     * @ORM\Column(type="integer", nullable=true)
     * @Groups({"admin"})
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

    public function getPosX(): ?int
    {
        return $this->posX;
    }

    public function setPosX(?int $posX): self
    {
        $this->posX = $posX;

        return $this;
    }

    public function getPosY(): ?int
    {
        return $this->posY;
    }

    public function setPosY(?int $posY): self
    {
        $this->posY = $posY;

        return $this;
    }
}
