# Analyse de l'arborescence source - Reservation Beth Rivkah

## Structure complète du projet

```
reservationberth/
│
├── 📁 src/                              # Code PHP Symfony
│   ├── 📁 Controller/                   # Contrôleurs HTTP
│   │   ├── 📁 Api/                      # Contrôleurs API personnalisés
│   │   │   ├── UserApiController.php    # Endpoint utilisateur courant
│   │   │   ├── ImportApiController.php  # Import de données
│   │   │   ├── ResetApiController.php   # Reset base de données
│   │   │   └── EvenementApiController.php # Stats événement
│   │   ├── SecurityController.php       # Authentification (login/logout)
│   │   ├── SpaController.php            # Sert le SPA React (catch-all)
│   │   ├── BilletWebController.php      # Synchronisation BilletWeb
│   │   ├── PersonneSearchController.php # Recherche avancée personnes
│   │   ├── PersonneTableController.php  # Assignation table
│   │   ├── UpdatePresenceController.php # Mise à jour présence
│   │   ├── SmsController.php            # Envoi SMS OVH
│   │   ├── ExportController.php         # Export Excel
│   │   ├── PdfController.php            # Génération PDF
│   │   └── MediaObjectController.php    # Upload fichiers
│   │
│   ├── 📁 Entity/                       # Entités Doctrine (API Platform)
│   │   ├── Personne.php                 # ⭐ Entité principale - invités
│   │   ├── Table.php                    # Tables de la salle
│   │   ├── Evenement.php                # Configuration événement
│   │   ├── MediaObject.php              # Fichiers uploadés
│   │   ├── CategoriePersonne.php        # Types d'invités
│   │   ├── CategorieTable.php           # Types de tables
│   │   ├── Civilite.php                 # Civilités (M., Mme)
│   │   └── User.php                     # Utilisateurs admin
│   │
│   ├── 📁 Repository/                   # Requêtes base de données
│   │   ├── PersonneRepository.php       # Recherche avancée personnes
│   │   ├── TableRepository.php          # Requêtes tables
│   │   ├── EvenementRepository.php      # Requêtes événements
│   │   └── ...Repository.php            # Autres repositories
│   │
│   ├── 📁 Service/                      # Logique métier
│   │   ├── BilletWebService.php         # Intégration API BilletWeb
│   │   ├── SmsService.php               # Intégration OVH SMS
│   │   ├── UtilsService.php             # Formatage texte
│   │   └── MpdfFactory.php              # Factory pour mPDF
│   │
│   ├── 📁 Normalizer/                   # Sérialisation API Platform
│   │   └── MediaObjectNormalizer.php    # URLs fichiers uploadés
│   │
│   ├── 📁 Validator/Constraints/        # Validations personnalisées
│   │   ├── moyenReglementConstraint.php # Validation moyen paiement
│   │   └── dateReglementConstraint.php  # Validation date règlement
│   │
│   ├── 📁 DataFixtures/                 # Données de test
│   │   ├── CiviliteFixtures.php
│   │   ├── CategorieTableFixtures.php
│   │   ├── CategoriePersonneFixtures.php
│   │   ├── UserFixtures.php
│   │   ├── EventFixtures.php
│   │   └── PersonneFixtures.php
│   │
│   ├── 📁 EventListener/                # Listeners d'événements
│   │   └── CsrfApiListener.php          # Protection CSRF pour API
│   │
│   └── Kernel.php                       # Kernel Symfony
│
├── 📁 assets/                           # Code frontend React/TypeScript
│   ├── 📁 components/                   # Composants React
│   │   ├── 📁 ui/                       # Composants Shadcn/Radix
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── input.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── date-picker.tsx
│   │   │   ├── sonner.tsx              # Toasts
│   │   │   ├── sidebar.tsx
│   │   │   └── ... (20+ composants UI)
│   │   │
│   │   ├── 📁 Tables/                   # Composants tables
│   │   │   ├── Table.tsx                # Table draggable
│   │   │   └── provider.tsx             # Provider tables
│   │   │
│   │   ├── 📁 layout/                   # Layouts
│   │   │   ├── ConnectedLayout.tsx      # Layout principal
│   │   │   └── AppLayout.tsx            # Layout alternatif
│   │   │
│   │   ├── PersonneDialog.tsx           # Dialog édition personne
│   │   ├── TableDialog.tsx              # Dialog édition table
│   │   ├── PersonCard.tsx               # Carte personne
│   │   ├── Search.tsx                   # Recherche globale
│   │   ├── HotesseSearch.tsx            # Recherche hôtesse
│   │   ├── Plan.tsx                     # Affichage plan
│   │   └── app-sidebar.tsx              # Navigation latérale
│   │
│   ├── 📁 pages/                        # Pages de l'application
│   │   ├── Dashboard.tsx                # /plan - Plan de salle
│   │   ├── Personnes.tsx                # /personnes - Gestion invités
│   │   ├── Tables.tsx                   # /tables - Gestion tables
│   │   ├── Evenement.tsx                # /evenement/edit - Config
│   │   ├── Hotesse.tsx                  # /hotesse - Interface hôtesse
│   │   ├── Settings.tsx                 # /settings - Paramètres
│   │   └── index.ts                     # Exports
│   │
│   ├── 📁 hooks/                        # Custom hooks React
│   │   ├── usePersonnes.ts              # CRUD personnes
│   │   ├── useTables.ts                 # CRUD tables
│   │   ├── useEvenement.ts              # Gestion événement
│   │   ├── useAuth.ts                   # Authentification
│   │   ├── useSearchPersonnes.ts        # Recherche debounced
│   │   ├── useApiMutation.ts            # Mutations avec toasts
│   │   ├── useGetMany.ts                # Fetch collection
│   │   ├── useDebounce.ts               # Debounce générique
│   │   ├── use-mobile.tsx               # Détection mobile
│   │   └── index.ts                     # Exports
│   │
│   ├── 📁 lib/                          # Utilitaires
│   │   ├── api.ts                       # Client API avec CSRF
│   │   ├── utils.ts                     # Fonction cn()
│   │   └── query-client.ts              # Config TanStack Query
│   │
│   ├── 📁 types/                        # Types TypeScript
│   │   ├── api.ts                       # Types des entités API
│   │   └── index.ts                     # Exports
│   │
│   ├── 📁 contexts/                     # React Context
│   │   └── DialogContext.tsx            # Gestion dialogs globale
│   │
│   ├── 📁 styles/                       # Styles
│   │   └── tailwind.css                 # CSS Tailwind principal
│   │
│   ├── SpaApp.tsx                       # ⭐ Entry point React SPA
│   ├── router.tsx                       # Configuration React Router
│   ├── spa.tsx                          # Bootstrap React
│   └── app.js                           # Bootstrap Stimulus (legacy)
│
├── 📁 config/                           # Configuration Symfony
│   ├── 📁 packages/
│   │   ├── api_platform.yaml            # Config API Platform
│   │   ├── security.yaml                # Authentification/autorisation
│   │   ├── doctrine.yaml                # Config ORM
│   │   ├── vich_uploader.yaml           # Config uploads
│   │   └── ...yaml                      # Autres configs
│   ├── 📁 routes/
│   │   └── api_platform.yaml            # Routes API
│   ├── services.yaml                    # Services container
│   └── routes.yaml                      # Routes web
│
├── 📁 templates/                        # Templates Twig
│   ├── 📁 spa/
│   │   └── index.html.twig              # Template SPA React
│   ├── 📁 pdf/
│   │   └── list_personne.html.twig      # Template PDF liste
│   ├── 📁 security/
│   │   └── login.html.twig              # Page de login
│   └── base.html.twig                   # Template de base
│
├── 📁 migrations/                       # Migrations Doctrine
│   └── Version*.php                     # Fichiers de migration
│
├── 📁 tests/                            # Tests PHPUnit
│   └── ...                              # Tests unitaires/fonctionnels
│
├── 📁 public/                           # Fichiers publics (web root)
│   ├── 📁 build/                        # Assets compilés (Webpack)
│   ├── 📁 uploads/                      # Fichiers uploadés
│   │   └── 📁 media/                    # Plans de salle
│   ├── index.php                        # Front controller
│   └── pdf_list_personne.css            # CSS pour PDF
│
├── 📁 docker/                           # Configuration Docker
│   └── 📁 nginx/
│       └── 📁 conf.d/                   # Config Nginx
│
├── 📁 translations/                     # Traductions i18n
│
├── 📁 var/                              # Cache et logs (gitignored)
│
├── 📁 vendor/                           # Dépendances PHP (gitignored)
│
├── 📁 node_modules/                     # Dépendances JS (gitignored)
│
├── 📄 compose.yaml                      # Docker Compose
├── 📄 Dockerfile                        # Image Docker PHP
├── 📄 composer.json                     # Dépendances PHP
├── 📄 package.json                      # Dépendances JS
├── 📄 webpack.config.js                 # Config Webpack Encore
├── 📄 tsconfig.json                     # Config TypeScript
├── 📄 postcss.config.js                 # Config PostCSS
├── 📄 tailwind.config.js                # Config Tailwind (si présent)
├── 📄 eslint.config.js                  # Config ESLint
├── 📄 phpunit.xml.dist                  # Config PHPUnit
├── 📄 .gitlab-ci.yml                    # CI/CD GitLab
├── 📄 CLAUDE.md                         # Instructions pour Claude Code
└── 📄 readme.md                         # README original
```

## Points d'entrée

### Backend (PHP)
- **Front Controller** : `public/index.php`
- **Kernel** : `src/Kernel.php`

### Frontend (React)
- **Entry Point** : `assets/spa.tsx` → `assets/SpaApp.tsx`
- **Router** : `assets/router.tsx`

### API
- **Base URL** : `/api/`
- **Entités** : `src/Entity/*.php` (auto-exposées via API Platform)

## Dossiers critiques

| Dossier | Importance | Rôle |
|---------|------------|------|
| `src/Entity/` | ⭐⭐⭐ | Définition du modèle de données |
| `src/Controller/` | ⭐⭐⭐ | Logique métier et endpoints |
| `src/Service/` | ⭐⭐⭐ | Intégrations externes (BilletWeb, OVH) |
| `assets/components/` | ⭐⭐⭐ | Interface utilisateur React |
| `assets/hooks/` | ⭐⭐ | Gestion état et API côté client |
| `config/packages/` | ⭐⭐ | Configuration Symfony |
| `migrations/` | ⭐⭐ | Évolution du schéma BDD |

## Fichiers de configuration clés

| Fichier | Rôle |
|---------|------|
| `config/packages/api_platform.yaml` | Configuration API REST |
| `config/packages/security.yaml` | Authentification et autorisations |
| `config/packages/doctrine.yaml` | Connexion base de données |
| `config/packages/vich_uploader.yaml` | Gestion des uploads |
| `webpack.config.js` | Build frontend |
| `.env` / `.env.local` | Variables d'environnement |

---

*Généré le 2026-01-15 par le workflow document-project BMAD*
