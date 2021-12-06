<?php

namespace App\Entity;

use App\Repository\PersonneRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Core\Annotation\ApiResource;
use Symfony\Component\Serializer\Annotation\Groups;
use ApiPlatform\Core\Annotation\ApiFilter;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\ExistsFilter;

/**
 * @ORM\Entity(repositoryClass=PersonneRepository::class)
 * @ApiResource(
 *  collectionOperations={"get"},
 *  itemOperations={"get"}
 * )
 * @ApiFilter(ExistsFilter::class, properties={"table"})
 */
class Personne
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
     * @ORM\Column(type="string", length=255)
     * @Groups({"admin"})
     */
    private $prenom;

    /**
     * @ORM\Column(type="string", length=255)
     * @Groups({"admin"})
     */
    private $adresse;

    /**
     * @ORM\Column(type="string", length=255)
     * @Groups({"admin"})
     */
    private $telephone;

    /**
     * @ORM\Column(type="string", length=255)
     * @Groups({"admin"})
     */
    private $email;

    /**
     * @ORM\Column(type="decimal", precision=6, scale=2, nullable=true)
     * @Groups({"admin"})
     */
    private $montantBillet;

    /**
     * @ORM\Column(type="decimal", precision=6, scale=2, nullable=true)
     * @Groups({"admin"})
     */
    private $montantPaye;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     * @Groups({"admin"})
     */
    private $dateReglement;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups({"admin"})
     */
    private $moyenPaiement;

    /**
     * @ORM\Column(type="text", nullable=true)
     * @Groups({"admin"})
     */
    private $commentaire;

    /**
     * @ORM\ManyToOne(targetEntity=CategoriePersonne::class)
     * @Groups({"admin"})
     */
    private $categorie;

    /**
     * @ORM\ManyToOne(targetEntity=Table::class, inversedBy="personnes", fetch="EAGER")
     */
    private $table;

    /**
     * @ORM\OneToOne(targetEntity=Personne::class, cascade={"persist", "remove"}, fetch="EAGER")
     * @Groups({"admin"})
     */
    private $conjoint;

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

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): self
    {
        $this->prenom = $prenom;

        return $this;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function setAdresse(string $adresse): self
    {
        $this->adresse = $adresse;

        return $this;
    }

    public function getTelephone(): ?string
    {
        return $this->telephone;
    }

    public function setTelephone(string $telephone): self
    {
        $this->telephone = $telephone;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getMontantBillet(): ?string
    {
        return $this->montantBillet;
    }

    public function setMontantBillet(?string $montantBillet): self
    {
        $this->montantBillet = $montantBillet;

        return $this;
    }

    public function getMontantPaye(): ?string
    {
        return $this->montantPaye;
    }

    public function setMontantPaye(?string $montantPaye): self
    {
        $this->montantPaye = $montantPaye;

        return $this;
    }

    public function getDateReglement(): ?\DateTimeInterface
    {
        return $this->dateReglement;
    }

    public function setDateReglement(?\DateTimeInterface $dateReglement): self
    {
        $this->dateReglement = $dateReglement;

        return $this;
    }

    public function getMoyenPaiement(): ?string
    {
        return $this->moyenPaiement;
    }

    public function setMoyenPaiement(?string $moyenPaiement): self
    {
        $this->moyenPaiement = $moyenPaiement;

        return $this;
    }

    public function getCommentaire(): ?string
    {
        return $this->commentaire;
    }

    public function setCommentaire(?string $commentaire): self
    {
        $this->commentaire = $commentaire;

        return $this;
    }

    public function getCategorie(): ?CategoriePersonne
    {
        return $this->categorie;
    }

    public function setCategorie(?CategoriePersonne $categorie): self
    {
        $this->categorie = $categorie;

        return $this;
    }

    public function getTable(): ?Table
    {
        return $this->table;
    }

    public function setTable(?Table $table): self
    {
        $this->table = $table;

        return $this;
    }

    public function getConjoint(): ?self
    {
        return $this->conjoint;
    }

    public function setConjoint(?self $conjoint): self
    {
        $this->conjoint = $conjoint;

        return $this;
    }
}
