<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\ExistsFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Put;
use App\Controller\SmsController;
use App\Controller\UpdatePresenceController;
use App\Repository\PersonneRepository;
use App\Service\UtilsService;
use App\Validator\Constraints as MyContraints;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: PersonneRepository::class)]
#[ORM\Index(columns: ['nom'], name: 'idx_personne_nom')]
#[ORM\Index(columns: ['email'], name: 'idx_personne_email')]
#[ORM\Index(columns: ['telephone'], name: 'idx_personne_telephone')]
#[ApiResource(
    normalizationContext: ['groups' => ['admin', 'personne']],
    operations: [
        new GetCollection(),
        new Get(),
        new Put(),
        new Put(
            uriTemplate: '/personnes/{id}/update-presence',
            controller: UpdatePresenceController::class,
            name: 'update_presence'
        ),
        new Get(
            uriTemplate: '/personnes/{id}/sms',
            controller: SmsController::class,
            name: 'send_sms'
        )
    ]
)]
#[ApiFilter(ExistsFilter::class, properties: ['table'])]
#[ApiFilter(SearchFilter::class, properties: [
    'nom' => 'partial',
    'prenom' => 'partial',
    'email' => 'partial',
    'telephone' => 'partial',
    'ville' => 'partial'
])]
class Personne
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['personne', 'table', 'ticket'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Groups(['personne', 'table', 'ticket'])]
    private ?string $nom = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['personne', 'table', 'ticket'])]
    private ?string $prenom = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['personne', 'ticket'])]
    private ?string $adresse = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Groups(['personne', 'ticket'])]
    private ?string $telephone = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Groups(['personne', 'ticket'])]
    private ?string $email = null;

    #[ORM\Column(type: 'decimal', precision: 6, scale: 2, nullable: true)]
    #[Groups(['personne'])]
    private ?string $montantBillet = null;

    #[ORM\Column(type: 'decimal', precision: 6, scale: 2, nullable: true)]
    #[Groups(['personne'])]
    private ?string $montantPaye = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    #[Groups(['personne'])]
    #[MyContraints\dateReglementConstraint]
    private ?\DateTimeInterface $dateReglement = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['personne'])]
    #[MyContraints\moyenReglementConstraint]
    private ?string $moyenPaiement = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['personne', 'ticket'])]
    private ?string $commentaire = null;

    #[ORM\ManyToOne(targetEntity: CategoriePersonne::class)]
    #[Groups(['personne', 'ticket'])]
    private ?CategoriePersonne $categorie = null;

    #[ORM\ManyToOne(targetEntity: Table::class, inversedBy: 'personnes', fetch: 'EAGER')]
    #[Groups(['personne', 'ticket'])]
    private ?Table $table = null;

    #[ORM\OneToOne(targetEntity: Personne::class, cascade: ['persist', 'remove'], fetch: 'EAGER')]
    #[Groups(['personne'])]
    private ?Personne $conjoint = null;

    #[ORM\OneToOne(targetEntity: Ticket::class, mappedBy: 'personne', cascade: ['persist', 'remove'], fetch: 'EAGER')]
    #[Groups(['personne'])]
    private ?Ticket $ticket = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['personne', 'ticket'])]
    private ?string $codePostal = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['personne', 'ticket'])]
    private ?string $ville = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    #[Groups(['personne', 'table'])]
    private ?bool $present = null;

    #[ORM\ManyToOne(targetEntity: Civilite::class, fetch: 'EAGER')]
    #[Groups(['admin', 'personne', 'table', 'ticket'])]
    private ?Civilite $civilite = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $idCerfa = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $mailEnvoye = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $billetWebTicketId = null;

    #[ORM\Column(type: 'boolean')]
    #[Groups(['personne', 'table'])]
    private bool $smsSended = false;

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
        $formattedNom = UtilsService::capitalizeFirstLetters($nom);
        $this->nom = $formattedNom;

        return $this;
    }

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    public function setPrenom(?string $prenom): self
    {
        $formattedPrenom = UtilsService::capitalizeFirstLetters($prenom);
        $this->prenom = $formattedPrenom;

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
        $formattedEmail = UtilsService::formatEmail($email);
        $this->email = $formattedEmail;

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

    public function getSmsSended(): ?bool
    {
        return $this->smsSended;
    }

    public function setSmsSended(bool $smsSended): self
    {
        $this->smsSended = $smsSended;

        return $this;
    }
}
