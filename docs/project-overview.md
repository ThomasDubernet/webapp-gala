# Reservation Beth Rivkah - Vue d'ensemble du projet

## Résumé exécutif

**Reservation Beth Rivkah** est une application web fullstack pour la gestion de réservations d'événements et le placement de tables. Elle gère l'inscription des invités, les affectations de tables, le suivi des paiements et la présence lors des événements (galas).

## Informations clés

| Attribut | Valeur |
|----------|--------|
| **Nom du projet** | Reservation Beth Rivkah |
| **Type de projet** | Web Application (Monolith Fullstack) |
| **Langage principal** | PHP 8.2+ / TypeScript |
| **Framework Backend** | Symfony 6.4 avec API Platform 3.x |
| **Framework Frontend** | React 18 avec Tailwind CSS v4 |
| **Base de données** | MySQL 8.0 |
| **Architecture** | Monolithique avec SPA React |

## Stack technologique

### Backend

| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| Framework | Symfony | 6.4.* | Framework PHP mature avec excellent support |
| API | API Platform | ^3.2 | API REST/JSON-LD auto-générée depuis entités |
| ORM | Doctrine | ^2.17 | Standard PHP pour persistence |
| PDF | mPDF | ^8.2 | Génération PDF côté serveur |
| Excel | PhpSpreadsheet | ^2.0 | Export de données |
| SMS | OVH API | ^3.2 | Notifications SMS France |
| Upload | VichUploader | ^2.3 | Gestion fichiers uploadés |

### Frontend

| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| UI Library | React | ^18.3.1 | SPA moderne, écosystème riche |
| Language | TypeScript | ^5.9.3 | Typage statique, meilleure maintenabilité |
| Styling | Tailwind CSS | ^4.1.18 | Utility-first, responsive design rapide |
| Components | Shadcn/Radix UI | - | Composants accessibles et personnalisables |
| State | TanStack Query | ^5.90.16 | Cache serveur, synchronisation données |
| Forms | React Hook Form | ^7.71.0 | Formulaires performants |
| Routing | React Router | ^7.12.0 | Navigation SPA |
| Build | Webpack Encore | ^5.3.1 | Build optimisé pour Symfony |

### Infrastructure

| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| Database | MySQL | 8.0 | SGBD relationnel robuste |
| Container | Docker | - | Environnement de dev isolé |
| Web Server | Nginx | latest | Reverse proxy performant |
| Email (dev) | MailCatcher | - | Test emails en développement |

## Structure du dépôt

```
reservationberth/
├── src/                    # Code PHP Symfony
│   ├── Controller/         # Contrôleurs (API + Web)
│   ├── Entity/             # Entités Doctrine (API Platform)
│   ├── Repository/         # Requêtes base de données
│   ├── Service/            # Logique métier
│   ├── Normalizer/         # Sérialisation personnalisée
│   └── EventListener/      # Listeners d'événements
├── assets/                 # Code frontend React/TypeScript
│   ├── components/         # Composants React
│   │   └── ui/             # Composants Shadcn/Radix
│   ├── pages/              # Pages de l'application
│   ├── hooks/              # Custom hooks React
│   ├── lib/                # Utilitaires et client API
│   ├── types/              # Types TypeScript
│   └── contexts/           # React Context providers
├── config/                 # Configuration Symfony
├── templates/              # Templates Twig
├── migrations/             # Migrations Doctrine
├── tests/                  # Tests PHPUnit
├── public/                 # Fichiers publics
├── docker/                 # Configuration Docker
└── docs/                   # Documentation projet (ce dossier)
```

## Intégrations externes

### BilletWeb (Billetterie)
- **But** : Synchronisation des billets vendus
- **Service** : `BilletWebService`
- **Endpoint** : `POST /api/billet-web/sync`
- **Authentification** : Basic Auth (token dans `.env`)

### OVH SMS
- **But** : Notifications SMS aux invités
- **Service** : `SmsService`
- **Endpoint** : `GET /api/personnes/{id}/sms`
- **Contenu** : Message de bienvenue avec numéro de table

## Liens vers documentation détaillée

- [Architecture](./architecture.md)
- [Modèles de données](./data-models.md)
- [Contrats API](./api-contracts.md)
- [Inventaire des composants](./component-inventory.md)
- [Guide de développement](./development-guide.md)
- [Arborescence source](./source-tree-analysis.md)

---

*Généré le 2026-01-15 par le workflow document-project BMAD*
