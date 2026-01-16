# Documentation du projet - Reservation Beth Rivkah

> **Point d'entrée principal** pour la documentation AI-assistée du projet.

## Vue d'ensemble du projet

| Attribut | Valeur |
|----------|--------|
| **Type** | Monolith Web Application |
| **Langage principal** | PHP 8.2 / TypeScript |
| **Framework Backend** | Symfony 6.4 + API Platform 3.x |
| **Framework Frontend** | React 18 + Tailwind CSS v4 |
| **Base de données** | MySQL 8.0 |
| **Architecture** | SPA + REST API |

### Description

Application de gestion de réservations d'événements (galas) :
- Gestion des invités et paiements
- Placement de tables interactif (drag & drop)
- Intégration BilletWeb (billetterie)
- Notifications SMS (OVH)
- Export Excel et génération PDF

---

## Référence rapide

### Stack technologique

**Backend :**
- Symfony 6.4, API Platform 3.x, Doctrine ORM
- mPDF, PhpSpreadsheet, Guzzle HTTP

**Frontend :**
- React 18, TypeScript 5.x, TanStack Query
- Tailwind CSS v4, Shadcn/ui (Radix), Lucide icons

**Infrastructure :**
- MySQL 8.0, Docker, Nginx, MailCatcher

### Points d'entrée

- **Application** : https://127.0.0.1:8000/
- **API** : https://127.0.0.1:8000/api/
- **Documentation API** : https://127.0.0.1:8000/api/doc

---

## Documentation générée

### Architecture et conception

- [Vue d'ensemble du projet](./project-overview.md) - Résumé exécutif et stack
- [Architecture](./architecture.md) - Patterns, flux de données, sécurité
- [Arborescence source](./source-tree-analysis.md) - Structure des dossiers annotée

### Référence technique

- [Modèles de données](./data-models.md) - Entités, relations, schéma BDD
- [Contrats API](./api-contracts.md) - Endpoints REST, payloads, erreurs
- [Inventaire des composants](./component-inventory.md) - Composants React/UI

### Guides

- [Guide de développement](./development-guide.md) - Installation, commandes, conventions

---

## Documentation existante

- [README](../readme.md) - Instructions originales du projet
- [CLAUDE.md](../CLAUDE.md) - Instructions pour Claude Code (référence AI)

---

## Démarrage rapide

```bash
# 1. Installer les dépendances
composer install && npm install

# 2. Démarrer Docker
docker compose up -d

# 3. Initialiser la base de données
composer run prepare

# 4. Lancer le serveur de développement
symfony serve -d && npm run watch
```

---

## Pour les développeurs AI

### Contexte métier

Le projet gère un **gala annuel** avec :
- ~500-1000 invités
- ~50-100 tables
- Suivi des paiements et présence
- Envoi de SMS de bienvenue avec numéro de table

### Entités clés

1. **Personne** - Invité avec infos contact, paiement, table
2. **Table** - Table physique avec position (x,y) et capacité
3. **Evenement** - Configuration du gala (nom, plan de salle)

### Flux principaux

1. Import des invités depuis BilletWeb
2. Placement des invités sur les tables (drag & drop)
3. Le jour J : enregistrement présence + SMS

### Conventions de code

- **PHP** : PSR-12, typage strict, attributs PHP 8
- **TypeScript** : ESLint + Prettier, composants fonctionnels
- **UI** : Toujours vérifier Shadcn/ui avant de créer un composant

---

## Métriques du projet

| Métrique | Valeur |
|----------|--------|
| Entités Doctrine | 8 |
| Endpoints API | ~25 |
| Composants React | 30+ |
| Services métier | 4 |
| Contrôleurs | 10 |
| Pages frontend | 6 |

---

*Documentation générée le 2026-01-15 par le workflow document-project BMAD v1.2.0*

*Mode : initial_scan | Niveau : exhaustive*
