<?php

namespace App\Entity;

use App\Repository\PersonneRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Core\Annotation\ApiResource;
use Symfony\Component\Serializer\Annotation\Groups;
use ApiPlatform\Core\Annotation\ApiFilter;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\ExistsFilter;
use App\Validator\Constraints as MyContraints;

;

/**
 * @ORM\Entity(repositoryClass=PersonneRepository::class)
 * @ApiResource(
 *  normalizationContext={"groups"={"admin", "personne"}},
 *  collectionOperations={"get"},
 *  itemOperations={
 *      "get",
 *      "put",
 *      "send_sms"={
 *          "method"="GET",
 *          "path"="/personnes/{id}/sms",
 *          "controller"=App\Controller\SmsController::class
 *      }
 *  }
 * )
 * @ApiFilter(ExistsFilter::class, properties={"table"})
 */
class Personne
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     * @Groups({"personne", "table", "ticket"})
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     * @Groups({"personne", "table", "ticket"})
     */
    private $nom;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups({"personne", "table", "ticket"})
     */
    private $prenom;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups({"personne", "ticket"})
     */
    private $adresse;

    /**
     * @ORM\Column(type="string", length=255)
     * @Groups({"personne", "ticket"})
     */
    private $telephone;

    /**
     * @ORM\Column(type="string", length=255)
     * @Groups({"personne", "ticket"})
     */
    private $email;

    /**
     * @ORM\Column(type="decimal", precision=6, scale=2, nullable=true)
     * @Groups({"personne"})
     */
    private $montantBillet;

    /**
     * @ORM\Column(type="decimal", precision=6, scale=2, nullable=true)
     * @Groups({"personne"})
     */
    private $montantPaye;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     * @Groups({"personne"})
     * @MyContraints\dateReglementConstraint
     */
    private $dateReglement;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups({"personne"})
     * @MyContraints\moyenReglementConstraint
     */
    private $moyenPaiement;

    /**
     * @ORM\Column(type="text", nullable=true)
     * @Groups({"personne", "ticket"})
     */
    private $commentaire;

    /**
     * @ORM\ManyToOne(targetEntity=CategoriePersonne::class)
     * @Groups({"personne", "ticket"})
     */
    private $categorie;

    /**
     * @ORM\ManyToOne(targetEntity=Table::class, inversedBy="personnes", fetch="EAGER")
     * @Groups({"personne", "ticket"})
     */
    private $table;

    /**
     * @ORM\OneToOne(targetEntity=Personne::class, cascade={"persist", "remove"}, fetch="EAGER")
     * @Groups({"personne"})
     */
    private $conjoint;

    /**
     * @ORM\OneToOne(targetEntity=Ticket::class, mappedBy="personne", cascade={"persist", "remove"}, fetch="EAGER")
     * @Groups({"personne"})
     */
    private $ticket;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups({"personne", "ticket"})
     */
    private $codePostal;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups({"personne", "ticket"})
     */
    private $ville;

    /**
     * @ORM\Column(type="boolean", nullable=true)
     * @Groups({"personne", "table"})
     */
    private $present;

    /**
     * @ORM\ManyToOne(targetEntity=Civilite::class, fetch="EAGER")
     * @Groups({"admin", "personne", "table", "ticket"})
     */
    private $civilite;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $idCerfa;

    /**
     * @ORM\Column(type="boolean", nullable=true)
     */
    private $mailEnvoye;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $billetWebTicketId;

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

    public function setPrenom(?string $prenom): self
    {
        $this->prenom = $prenom;

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

    public function getTicket(): ?Ticket
    {
        return $this->ticket;
    }

    public function setTicket(Ticket $ticket): self
    {
        // set the owning side of the relation if necessary
        if ($ticket->getPersonne() !== $this) {
            $ticket->setPersonne($this);
        }

        $this->ticket = $ticket;

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

    public function getPresent(): ?bool
    {
        return $this->present;
    }

    public function setPresent(?bool $present): self
    {
        $this->present = $present;

        return $this;
    }

    public function getCivilite(): ?Civilite
    {
        return $this->civilite;
    }

    public function setCivilite(?Civilite $civilite): self
    {
        $this->civilite = $civilite;

        return $this;
    }

    public function getIdCerfa(): ?string
    {
        return $this->idCerfa;
    }

    public function setIdCerfa(?string $idCerfa): self
    {
        $this->idCerfa = $idCerfa;

        return $this;
    }

    public function getMailEnvoye(): ?bool
    {
        return $this->mailEnvoye;
    }

    public function setMailEnvoye(?bool $mailEnvoye): self
    {
        $this->mailEnvoye = $mailEnvoye;

        return $this;
    }

    public function getBilletWebTicketId(): ?string
    {
        return $this->billetWebTicketId;
    }

    public function setBilletWebTicketId(?string $billetWebTicketId): self
    {
        $this->billetWebTicketId = $billetWebTicketId;

        return $this;
    }
}
