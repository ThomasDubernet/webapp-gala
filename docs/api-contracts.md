# Contrats API - Reservation Beth Rivkah

## Vue d'ensemble

L'API REST est construite avec **API Platform 3.x** et expose automatiquement les entités Doctrine. Elle supporte les formats **JSON** et **JSON-LD** (Hydra).

**Base URL** : `/api/`

**Authentification** : Session-based (form login) avec protection CSRF via cookie `XSRF-TOKEN`.

## Configuration globale

```yaml
# config/packages/api_platform.yaml
api_platform:
    title: 'Reservation Beth Rivkah API'
    version: '1.0.0'
    formats:
        jsonld: ['application/ld+json']
        json: ['application/json']
    patch_formats:
        json: ['application/merge-patch+json']
    defaults:
        pagination_enabled: false
```

## Headers requis

### Requêtes de lecture (GET)
```
Accept: application/json
```

### Requêtes de modification (POST/PUT/DELETE)
```
Content-Type: application/json
X-XSRF-TOKEN: {token_from_cookie}
```

### Requêtes PATCH
```
Content-Type: application/merge-patch+json
X-XSRF-TOKEN: {token_from_cookie}
```

---

## Endpoints par ressource

### Personnes (`/api/personnes`)

#### Liste avec recherche
```
GET /api/personnes/search
```

**Query Parameters** :
| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `q` | string | - | Terme de recherche (nom, prénom, email, téléphone, ville) |
| `unassigned` | boolean | false | Filtrer personnes sans table |
| `page` | integer | 1 | Page courante |
| `limit` | integer | 50 | Éléments par page (max 100) |

**Response** :
```json
{
  "items": [
    {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean@example.com",
      "telephone": "0612345678",
      "adresse": "123 rue Example",
      "codePostal": "75001",
      "ville": "Paris",
      "montantBillet": "150.00",
      "montantPaye": "150.00",
      "dateReglement": "2026-01-10T00:00:00+00:00",
      "moyenPaiement": "CB",
      "present": true,
      "smsSended": false,
      "categorie": {"id": 1, "nom": "VIP"},
      "table": {"id": 1, "numero": 1, "nom": "Table 1"},
      "civilite": {"id": 1, "nom": "M."},
      "conjoint": null
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50,
  "pages": 3
}
```

#### Détail d'une personne
```
GET /api/personnes/{id}
```

#### Créer une personne
```
POST /api/personnes
```

**Body** :
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean@example.com",
  "telephone": "0612345678",
  "civilite": "/api/civilites/1",
  "categorie": "/api/categorie_personnes/2",
  "table": "/api/tables/5"
}
```

> **Note** : Les relations utilisent le format IRI (`/api/{resource}/{id}`).

#### Mettre à jour une personne
```
PUT /api/personnes/{id}
```

#### Supprimer une personne
```
DELETE /api/personnes/{id}
```

#### Mettre à jour la présence
```
PUT /api/personnes/{id}/update-presence
```

**Body** :
```json
{
  "present": true,
  "withSms": true
}
```

**Logique** : Si `withSms: true` et la personne a une table assignée, un SMS de bienvenue est envoyé via OVH.

#### Envoyer un SMS
```
GET /api/personnes/{id}/sms
```

Déclenche l'envoi du SMS de bienvenue avec le numéro de table.

---

### Tables (`/api/tables`)

#### Liste des tables
```
GET /api/tables
```

**Response** (format Hydra) :
```json
{
  "@context": "/api/contexts/Table",
  "@id": "/api/tables",
  "@type": "hydra:Collection",
  "hydra:member": [
    {
      "@id": "/api/tables/1",
      "@type": "Table",
      "id": 1,
      "nom": "Table VIP 1",
      "numero": 1,
      "nombrePlacesMax": 10,
      "posX": "25.50",
      "posY": "30.00",
      "categorie": {"id": 1, "nom": "VIP", "couleur": "#FFD700"},
      "personnes": [
        {"id": 1, "nom": "Dupont", "prenom": "Jean", "present": true}
      ]
    }
  ],
  "hydra:totalItems": 25
}
```

#### Créer une table
```
POST /api/tables
```

**Body** :
```json
{
  "nom": "Table 10",
  "numero": 10,
  "nombrePlacesMax": 8,
  "posX": "50.00",
  "posY": "60.00",
  "categorie": "/api/categorie_tables/1"
}
```

#### Mettre à jour une table
```
PUT /api/tables/{id}
```

#### Mettre à jour la position (PATCH)
```
PATCH /api/tables/{id}
```

**Body** :
```json
{
  "posX": "55.25",
  "posY": "62.10"
}
```

#### Supprimer une table
```
DELETE /api/tables/{id}
```

---

### Événements (`/api/evenements`)

#### Liste des événements
```
GET /api/evenements
```

#### Détail d'un événement
```
GET /api/evenements/{id}
```

**Response** :
```json
{
  "id": 1,
  "nom": "Gala 2026",
  "plan": {
    "id": 1,
    "contentUrl": "/uploads/media/plan.jpg",
    "filePath": "plan.jpg"
  },
  "billetwebId": "12345",
  "lastUpdateBilletWeb": "2026-01-15T08:00:00+00:00"
}
```

#### Mettre à jour un événement
```
PUT /api/evenements/{id}
```

---

### Synchronisation BilletWeb

#### Synchroniser les tickets
```
POST /api/billet-web/sync
```

**Response (succès)** :
```json
{
  "message": "15 participant(s) ont été synchronisé(s) avec billet web",
  "lastSyncDate": "2026-01-14T10:00:00",
  "newLastSyncDate": "2026-01-15T10:00:00"
}
```

**Response (erreur)** :
```json
{
  "error": "ERROR_SYNC_BILLET_WEB_001",
  "status": "error",
  "message": "No event found"
}
```

**Codes d'erreur** :
| Code | Description |
|------|-------------|
| `ERROR_SYNC_BILLET_WEB_001` | Aucun événement configuré |
| `ERROR_SYNC_BILLET_WEB_002` | ID BilletWeb manquant |
| `ERROR_SYNC_BILLET_WEB_003` | Erreur API BilletWeb |

---

### Données de référence

#### Civilités
```
GET /api/civilites
```

#### Catégories de personnes
```
GET /api/categorie_personnes
```

#### Catégories de tables
```
GET /api/categorie_tables
```

---

### API d'administration

#### Utilisateur courant
```
GET /api/me
```

#### Statistiques de l'événement
```
GET /api/evenement/stats
```

#### Import de personnes
```
POST /api/import
```

#### Reset de la base
```
POST /api/reset
```

---

## Endpoints web (non-API)

### Export Excel
```
GET /export
```
Télécharge un fichier `.xlsx` avec toutes les personnes.

### PDF liste par table
```
GET /table/{id}/pdf
```
Génère un PDF avec la liste des personnes d'une table.

### Authentification
```
POST /login
GET /logout
```

---

## Gestion des erreurs

### Codes HTTP
| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Ressource créée |
| 204 | Suppression réussie |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Ressource non trouvée |
| 422 | Erreur de validation |
| 500 | Erreur serveur |

### Format d'erreur (Hydra)
```json
{
  "@context": "/api/contexts/Error",
  "@type": "hydra:Error",
  "hydra:title": "An error occurred",
  "hydra:description": "Le champ email est requis"
}
```

---

## Protection CSRF

Le frontend utilise un système de token CSRF :

1. Le serveur définit un cookie `XSRF-TOKEN` à chaque réponse
2. Le client lit ce cookie et l'envoie dans le header `X-XSRF-TOKEN`
3. Le serveur vérifie que le header correspond au cookie

**Implémentation** : `src/EventListener/CsrfApiListener.php`

---

*Généré le 2026-01-15 par le workflow document-project BMAD*
