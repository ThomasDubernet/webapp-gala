# Guide de développement - Reservation Beth Rivkah

## Prérequis

### Système
- **PHP** : ≥ 8.2
- **Node.js** : ≥ 18.x (recommandé : 20.x)
- **Composer** : ≥ 2.x
- **Docker** et **Docker Compose**
- **Symfony CLI** (recommandé)

### Vérification des prérequis
```bash
# Vérifier PHP et extensions
php -v
symfony check:requirements

# Vérifier Node.js
node -v
npm -v

# Vérifier Docker
docker --version
docker compose version
```

---

## Installation

### 1. Cloner le projet
```bash
git clone <repo-url> reservationberth
cd reservationberth
```

### 2. Installer les dépendances
```bash
# Backend PHP
composer install

# Frontend JavaScript
npm install
```

### 3. Configuration environnement
```bash
# Copier le fichier d'environnement
cp .env .env.local

# Éditer .env.local avec vos valeurs :
# - DATABASE_URL
# - BILLET_WEB_BASIC (token BilletWeb)
# - OVH credentials (pour SMS)
```

### 4. Démarrer les services Docker
```bash
docker compose up -d
```

Services démarrés :
- **MySQL** : port 3306
- **MailCatcher** : port 1080 (interface web)
- **Nginx** : port 80 (optionnel)

### 5. Initialiser la base de données
```bash
# Créer la base et charger les fixtures
composer run prepare
```

### 6. Démarrer le serveur de développement
```bash
# Terminal 1 - Serveur Symfony
symfony serve -d

# Terminal 2 - Build frontend avec watch
npm run watch
```

L'application est accessible sur : https://127.0.0.1:8000

---

## Commandes utiles

### Base de données

```bash
# Reset complet (drop + create + fixtures)
composer run prepare

# Générer une migration après modification d'entité
composer run upmigration

# Appliquer les migrations
symfony console doctrine:migrations:migrate

# Voir le schéma actuel
symfony console doctrine:schema:validate
```

### Frontend

```bash
# Build de développement (one-shot)
npm run dev

# Build avec watch (recommandé)
npm run watch

# Build de production
npm run build

# Linting
npx eslint assets/
```

### Tests

```bash
# Tous les tests
php bin/phpunit --testdox

# Un fichier spécifique
php bin/phpunit tests/Path/To/TestFile.php

# Une méthode spécifique
php bin/phpunit --filter testMethodName
```

### Cache Symfony

```bash
# Vider le cache
symfony console cache:clear

# Vider le cache de production
symfony console cache:clear --env=prod
```

---

## Structure du code

### Backend (Symfony)

```
src/
├── Controller/       # Endpoints HTTP
├── Entity/           # Modèles Doctrine (API Platform)
├── Repository/       # Requêtes BDD personnalisées
├── Service/          # Logique métier
├── Normalizer/       # Sérialisation API
├── Validator/        # Contraintes de validation
├── DataFixtures/     # Données de test
└── EventListener/    # Listeners d'événements
```

### Frontend (React)

```
assets/
├── components/       # Composants React
│   └── ui/           # Composants Shadcn/Radix
├── pages/            # Pages de l'application
├── hooks/            # Custom hooks
├── lib/              # Utilitaires
├── types/            # Types TypeScript
└── contexts/         # React Context
```

---

## Conventions de code

### PHP

- **PSR-12** : Standard de codage
- **Typage strict** : Utiliser les types PHP 8
- **Attributs** : Préférer les attributs PHP 8 aux annotations

```php
#[Route('/api/example', methods: ['GET'])]
public function example(): JsonResponse
{
    // ...
}
```

### TypeScript/React

- **ESLint + Prettier** : Formatage automatique
- **Composants fonctionnels** : Pas de classes
- **Hooks** : Préfixe `use` pour les custom hooks

```typescript
// Bon
function usePersonnes() { ... }
function PersonCard({ personne }: PersonCardProps) { ... }

// Éviter
class PersonCard extends React.Component { ... }
```

### Shadcn/ui

**IMPORTANT** : Avant de créer un composant UI, vérifier s'il existe sur Shadcn/ui :

```bash
# Installer un composant Shadcn
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add select
```

Les composants sont installés dans `assets/components/ui/`.

### Styling

- **Tailwind CSS v4** : Classes utilitaires
- **tailwind-merge** : Fusion de classes
- **cva** : Variantes de composants

```typescript
import { cn } from '@/lib/utils';

<div className={cn('base-class', condition && 'conditional-class')} />
```

---

## Workflow Git

### Branches

- `main` : Production stable
- `feat/*` : Nouvelles fonctionnalités
- `fix/*` : Corrections de bugs
- `refactor/*` : Refactoring

### Commits

Format recommandé :
```
[Type] Description courte

Type: Feature, Fix, Improve, Refactor, Chore, Docs
```

Exemples :
```
[Feature] Add SMS notification on presence update
[Fix] Fix table position calculation on resize
[Improve] Optimize search query performance
```

---

## API Platform

### Ajouter une entité à l'API

1. Créer l'entité avec les attributs API Platform :
```php
#[ApiResource(
    normalizationContext: ['groups' => ['read']],
    operations: [
        new GetCollection(),
        new Get(),
        new Post(),
        new Put(),
        new Delete(),
    ]
)]
class MyEntity
{
    #[Groups(['read'])]
    private ?int $id = null;

    // ...
}
```

2. Générer la migration :
```bash
composer run upmigration
```

3. Tester l'endpoint :
```bash
curl http://127.0.0.1:8000/api/my_entities
```

### Ajouter un endpoint personnalisé

```php
#[ApiResource(
    operations: [
        // ... standard operations
        new Get(
            uriTemplate: '/my_entities/{id}/custom',
            controller: MyCustomController::class,
            name: 'custom_action'
        ),
    ]
)]
```

---

## Intégrations externes

### BilletWeb

Configuration dans `.env.local` :
```env
BILLET_WEB_BASIC=your_base64_token
```

Le service `BilletWebService` gère :
- Création de commandes
- Synchronisation des participants

### OVH SMS

Configuration dans `config/services.yaml` :
```yaml
services:
    ovh.sms_api:
        class: Ovh\Api
        arguments:
            - '%env(OVH_APP_KEY)%'
            - '%env(OVH_APP_SECRET)%'
            - '%env(OVH_ENDPOINT)%'
            - '%env(OVH_CONSUMER_KEY)%'
```

---

## Debugging

### Symfony Profiler

Accessible en développement via la barre d'outils ou `/app_dev.php/_profiler/`.

### API Platform Swagger

Documentation interactive : `/api/doc`

### React Query Devtools

Activées automatiquement en développement (coin inférieur droit).

### Logs

```bash
# Logs Symfony
tail -f var/log/dev.log

# Logs Docker
docker compose logs -f database
```

---

## Déploiement

### Build de production

```bash
# Frontend
npm run build

# Vider le cache
symfony console cache:clear --env=prod

# Vérifier les migrations
symfony console doctrine:migrations:status --env=prod
```

### Variables d'environnement production

```env
APP_ENV=prod
APP_DEBUG=0
DATABASE_URL=mysql://user:pass@host:3306/db
```

---

## Ressources

- [Symfony Documentation](https://symfony.com/doc/current/index.html)
- [API Platform Documentation](https://api-platform.com/docs/)
- [React Documentation](https://react.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

*Généré le 2026-01-15 par le workflow document-project BMAD*
