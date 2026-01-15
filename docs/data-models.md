# Modèles de données - Reservation Beth Rivkah

## Vue d'ensemble

Le projet utilise **Doctrine ORM** avec **API Platform** pour exposer automatiquement les entités via REST API. Toutes les entités sont définies dans `src/Entity/` et utilisent les attributs PHP 8 pour la configuration.

## Schéma relationnel

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│  Evenement  │     │    Table    │     │    Personne     │
├─────────────┤     ├─────────────┤     ├─────────────────┤
│ id          │     │ id          │     │ id              │
│ nom         │     │ nom         │     │ nom             │
│ plan (FK)───┼──┐  │ numero      │  ┌──┤ prenom          │
│ billetwebId │  │  │ nombrePlacesMax│  │ email           │
│ lastUpdate..│  │  │ posX        │  │  │ telephone       │
└─────────────┘  │  │ posY        │  │  │ adresse         │
                 │  │ categorie(FK)──┐│ │ montantBillet   │
┌─────────────┐  │  └───────┬─────┘ ││  │ montantPaye     │
│ MediaObject │  │          │       ││  │ dateReglement   │
├─────────────┤  │          │       ││  │ moyenPaiement   │
│ id          │◄─┘          │       ││  │ present         │
│ contentUrl  │             │       ││  │ smsSended       │
│ filePath    │    ┌────────┴────┐  ││  │ table (FK)──────┤
└─────────────┘    │CategorieTable│ ││  │ categorie (FK)──┼──┐
                   ├─────────────┤ ││  │ civilite (FK)───┼──┼─┐
                   │ id          │ ││  │ conjoint (FK)───┼──┼─┼─┐
                   │ nom         │ └┼──┤                 │  │ │ │
                   │ couleur     │  │  └─────────────────┘  │ │ │
                   └─────────────┘  │                       │ │ │
                                    │  ┌─────────────────┐  │ │ │
                                    │  │CategoriePersonne│◄─┘ │ │
                                    │  ├─────────────────┤    │ │
                                    │  │ id              │    │ │
                                    │  │ nom             │    │ │
                                    │  └─────────────────┘    │ │
                                    │                         │ │
                                    │  ┌─────────────────┐    │ │
                                    │  │    Civilite     │◄───┘ │
                                    │  ├─────────────────┤      │
                                    │  │ id              │      │
                                    │  │ nom             │      │
                                    │  └─────────────────┘      │
                                    │                           │
                                    └───────────────────────────┘
                                    (self-reference conjoint)
```

## Entités détaillées

### Personne

Entité principale représentant un invité/participant.

**Fichier** : `src/Entity/Personne.php`

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| `id` | integer | Non | Identifiant auto-généré |
| `nom` | string(255) | Non | Nom de famille (formaté en capitalisation) |
| `prenom` | string(255) | Oui | Prénom (formaté en capitalisation) |
| `email` | string(255) | Non | Email (formaté en minuscules) |
| `telephone` | string(255) | Oui | Numéro de téléphone |
| `adresse` | string(255) | Oui | Adresse postale |
| `codePostal` | string(255) | Oui | Code postal |
| `ville` | string(255) | Oui | Ville |
| `montantBillet` | decimal(6,2) | Oui | Montant du billet |
| `montantPaye` | decimal(6,2) | Oui | Montant effectivement payé |
| `dateReglement` | datetime | Oui | Date du paiement |
| `moyenPaiement` | string(255) | Oui | Mode de paiement (CB, chèque, etc.) |
| `commentaire` | text | Oui | Notes libres |
| `present` | boolean | Oui | Présence confirmée à l'événement |
| `smsSended` | boolean | Non | SMS de bienvenue envoyé |
| `idCerfa` | string(255) | Oui | N° donateur CERFA |
| `billetWebTicketId` | string(255) | Oui | ID ticket BilletWeb externe |

**Relations** :
- `table` → `Table` (ManyToOne) : Table assignée
- `categorie` → `CategoriePersonne` (ManyToOne) : Catégorie d'invité
- `civilite` → `Civilite` (ManyToOne) : Civilité (M., Mme, etc.)
- `conjoint` → `Personne` (OneToOne, self-reference) : Conjoint lié

**Index de recherche** :
- `idx_personne_nom` sur `nom`
- `idx_personne_email` sur `email`
- `idx_personne_telephone` sur `telephone`

**Filtres API Platform** :
- `ExistsFilter` sur `table` (pour filtrer assignés/non-assignés)
- `SearchFilter` (partial) sur `nom`, `prenom`, `email`, `telephone`, `ville`

**Endpoints API** :
- `GET /api/personnes` - Liste paginée
- `GET /api/personnes/{id}` - Détail
- `POST /api/personnes` - Création
- `PUT /api/personnes/{id}` - Mise à jour complète
- `DELETE /api/personnes/{id}` - Suppression
- `PUT /api/personnes/{id}/update-presence` - Mise à jour présence
- `GET /api/personnes/{id}/sms` - Envoi SMS

---

### Table

Représente une table physique dans la salle.

**Fichier** : `src/Entity/Table.php`

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| `id` | integer | Non | Identifiant auto-généré |
| `nom` | string(255) | Oui | Nom descriptif de la table |
| `numero` | integer | Non | Numéro de table |
| `nombrePlacesMax` | integer | Non | Capacité maximale |
| `posX` | decimal(6,2) | Oui | Position X sur le plan (%) |
| `posY` | decimal(6,2) | Oui | Position Y sur le plan (%) |

**Relations** :
- `categorie` → `CategorieTable` (ManyToOne) : Catégorie/type de table
- `personnes` ← `Personne` (OneToMany) : Personnes assignées

**Endpoints API** :
- `GET /api/tables` - Liste
- `GET /api/tables/{id}` - Détail avec personnes assignées
- `POST /api/tables` - Création
- `PUT /api/tables/{id}` - Mise à jour
- `PATCH /api/tables/{id}` - Mise à jour partielle (position)
- `DELETE /api/tables/{id}` - Suppression

---

### Evenement

Configuration de l'événement (gala).

**Fichier** : `src/Entity/Evenement.php`

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| `id` | integer | Non | Identifiant auto-généré |
| `nom` | string(255) | Oui | Nom de l'événement |
| `billetwebId` | string(255) | Oui | ID événement BilletWeb |
| `lastUpdateBilletWeb` | datetime | Oui | Dernière synchro BilletWeb |

**Relations** :
- `plan` → `MediaObject` (OneToOne) : Image du plan de salle

**Endpoints API** :
- `GET /api/evenements` - Liste
- `GET /api/evenements/{id}` - Détail
- `PUT /api/evenements/{id}` - Mise à jour

---

### MediaObject

Gestion des fichiers uploadés (plans de salle).

**Fichier** : `src/Entity/MediaObject.php`

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| `id` | integer | Non | Identifiant auto-généré |
| `contentUrl` | string | Oui | URL publique du fichier |
| `filePath` | string | Oui | Chemin du fichier sur disque |

**Configuration VichUploader** : mapping `media_object`, stockage dans `public/uploads/`

---

### CategorieTable

Types de tables (VIP, standard, etc.).

**Fichier** : `src/Entity/CategorieTable.php`

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| `id` | integer | Non | Identifiant |
| `nom` | string(255) | Non | Nom de la catégorie |
| `couleur` | string(255) | Non | Code couleur CSS |

**Endpoints** : `GET /api/categorie_tables` uniquement

---

### CategoriePersonne

Types d'invités (Honorables, Famille, etc.).

**Fichier** : `src/Entity/CategoriePersonne.php`

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| `id` | integer | Non | Identifiant |
| `nom` | string(255) | Non | Nom de la catégorie |

**Endpoints** : `GET /api/categorie_personnes` uniquement

---

### Civilite

Civilités (M., Mme, Dr., etc.).

**Fichier** : `src/Entity/Civilite.php`

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| `id` | integer | Non | Identifiant |
| `nom` | string(255) | Non | Libellé de la civilité |

**Endpoints** : CRUD complet via API Platform

---

### User

Utilisateurs de l'application (administrateurs).

**Fichier** : `src/Entity/User.php`

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| `id` | integer | Non | Identifiant |
| `email` | string(180) | Non | Email (unique) |
| `roles` | json | Non | Rôles (ROLE_USER, ROLE_ADMIN) |
| `password` | string | Non | Mot de passe hashé |

**Non exposé via API** - Authentification form login uniquement.

---

## Fixtures (données de test)

Les fixtures sont définies dans `src/DataFixtures/` :

| Fichier | Description |
|---------|-------------|
| `CiviliteFixtures.php` | M., Mme, Dr., etc. |
| `CategorieTableFixtures.php` | Types de tables avec couleurs |
| `CategoriePersonneFixtures.php` | Types d'invités |
| `UserFixtures.php` | Utilisateur admin de test |
| `EventFixtures.php` | Événement de test |
| `PersonneFixtures.php` | Invités de test |

**Commande** : `composer run prepare` pour réinitialiser la base avec fixtures.

---

## Migrations

Les migrations sont stockées dans `migrations/` et gérées par Doctrine Migrations.

**Commandes** :
```bash
# Créer une nouvelle migration après modification d'entité
composer run upmigration

# Appliquer les migrations
symfony console doctrine:migrations:migrate
```

---

*Généré le 2026-01-15 par le workflow document-project BMAD*
