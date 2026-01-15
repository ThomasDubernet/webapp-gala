# Inventaire des composants UI - Reservation Beth Rivkah

## Vue d'ensemble

Le frontend utilise **React 18** avec **TypeScript** et s'appuie sur :
- **Shadcn/ui** : Composants accessibles basés sur Radix UI
- **Tailwind CSS v4** : Styling utility-first
- **Lucide React** : Icônes

## Structure des dossiers

```
assets/
├── components/
│   ├── ui/                 # Composants Shadcn/Radix (réutilisables)
│   ├── Tables/             # Composants liés aux tables
│   ├── layout/             # Layouts et navigation
│   └── *.tsx               # Composants métier
├── pages/                  # Pages de l'application
├── hooks/                  # Custom hooks React
├── lib/                    # Utilitaires
├── types/                  # Types TypeScript
└── contexts/               # React Context providers
```

---

## Composants Shadcn/ui (`assets/components/ui/`)

Ces composants suivent les patterns Shadcn avec `class-variance-authority` et `tailwind-merge`.

| Composant | Fichier | Description | Basé sur |
|-----------|---------|-------------|----------|
| **Button** | `button.tsx` | Bouton avec variantes | Radix Slot |
| **Card** | `card.tsx` | Container avec header/content/footer | - |
| **Dialog** | `dialog.tsx` | Modal accessible | Radix Dialog |
| **DropdownMenu** | `dropdown-menu.tsx` | Menu déroulant contextuel | Radix DropdownMenu |
| **Input** | `input.tsx` | Champ de saisie | - |
| **Label** | `label.tsx` | Label de formulaire | Radix Label |
| **Select** | `select.tsx` | Liste déroulante | Radix Select |
| **Checkbox** | `checkbox.tsx` | Case à cocher | - |
| **Textarea** | `textarea.tsx` | Zone de texte multi-ligne | - |
| **Badge** | `badge.tsx` | Badge/tag avec variantes | - |
| **Separator** | `separator.tsx` | Séparateur visuel | Radix Separator |
| **Tooltip** | `tooltip.tsx` | Info-bulle | Radix Tooltip |
| **Popover** | `popover.tsx` | Pop-up positionné | Radix Popover |
| **Calendar** | `calendar.tsx` | Sélecteur de date | react-day-picker |
| **DatePicker** | `date-picker.tsx` | Input avec calendrier | Popover + Calendar |
| **Sheet** | `sheet.tsx` | Panel latéral glissant | Radix Dialog |
| **Sidebar** | `sidebar.tsx` | Barre latérale de navigation | - |
| **Breadcrumb** | `breadcrumb.tsx` | Fil d'Ariane | - |
| **ContextMenu** | `context-menu.tsx` | Menu clic droit | Radix ContextMenu |
| **Skeleton** | `skeleton.tsx` | Placeholder de chargement | - |
| **Sonner** | `sonner.tsx` | Notifications toast | Sonner |
| **Modal** | `modal.tsx` | Modal de confirmation | Dialog |
| **Kbd** | `kbd.tsx` | Raccourci clavier stylé | - |

---

## Composants métier (`assets/components/`)

### PersonneDialog
**Fichier** : `PersonneDialog.tsx`

Dialog modal pour créer/éditer une personne. Utilise React Hook Form + Zod pour la validation.

**Props** :
- `personneId?: number` - ID pour édition, undefined pour création
- `onSuccess?: () => void` - Callback après sauvegarde

**Fonctionnalités** :
- Formulaire complet avec tous les champs Personne
- Sélection civilité, catégorie, table via Select
- Gestion du conjoint
- Validation côté client

---

### TableDialog
**Fichier** : `TableDialog.tsx`

Dialog modal pour créer/éditer une table.

**Props** :
- `tableId?: number` - ID pour édition
- `onSuccess?: () => void` - Callback

---

### PersonCard
**Fichier** : `PersonCard.tsx`

Carte compacte affichant un invité.

**Props** :
```typescript
interface PersonCardProps {
  personne: Personne;
  onRefresh?: () => void;
  variant?: 'default' | 'compact';
  onEdit?: (id: number) => void;
}
```

**Affiche** :
- Nom, prénom, civilité
- Statut paiement (badge coloré)
- Numéro de table
- Checkbox présence
- Menu actions (éditer, supprimer)

---

### Search
**Fichier** : `Search.tsx`

Barre de recherche globale avec raccourci clavier (⌘K / Ctrl+K).

**Composants internes** :
- `SearchBar` : Bouton trigger + modal
- `Personne` : Affichage d'un résultat
- `PersonneProvider` : Wrapper avec gestion présence

**Fonctionnalités** :
- Recherche debounced (min 2 caractères)
- Résultats paginés
- Actions rapides sur les résultats
- Fermeture avec Escape

---

### Plan
**Fichier** : `Plan.tsx`

Affichage du plan de salle avec les tables positionnées.

**Utilise** : `TableProvider` pour le rendu des tables

---

### HotesseSearch
**Fichier** : `HotesseSearch.tsx`

Interface simplifiée de recherche pour les hôtesses d'accueil.

**Spécificités** :
- Vue compacte sans menu
- Focus sur la présence
- Affichage du numéro de table proéminent

---

### app-sidebar
**Fichier** : `app-sidebar.tsx`

Barre latérale de navigation principale.

**Liens** :
- Plan (Dashboard)
- Personnes
- Tables
- Événement
- Settings

---

## Composants Tables (`assets/components/Tables/`)

### Table
**Fichier** : `Table.tsx`

Représentation visuelle d'une table sur le plan.

**Props** :
```typescript
interface TableProps {
  table: TableType;
  onDragStop: (id: number, x: number, y: number) => void;
  containerRef: RefObject<HTMLDivElement>;
}
```

**Fonctionnalités** :
- Draggable avec react-draggable
- Affichage du numéro et occupation
- Couleur selon catégorie
- Menu contextuel (clic droit)

---

### TableProvider
**Fichier** : `provider.tsx`

Container qui gère le rendu de toutes les tables.

**Props** :
```typescript
interface TableProviderProps {
  tables: TableType[];
  plan: RefObject<HTMLDivElement>;
  load: () => void;
  container?: RefObject<HTMLDivElement>;
}
```

---

## Layouts (`assets/components/layout/`)

### ConnectedLayout
**Fichier** : `ConnectedLayout.tsx`

Layout principal pour les utilisateurs connectés.

**Structure** :
```
┌──────────────────────────────────────┐
│            Header/Navbar             │
├──────────┬───────────────────────────┤
│          │                           │
│ Sidebar  │        Content            │
│          │      (Outlet)             │
│          │                           │
└──────────┴───────────────────────────┘
```

**Inclut** :
- Sidebar de navigation
- SearchBar globale
- DialogContext provider
- Toaster pour notifications

---

### AppLayout
**Fichier** : `AppLayout.tsx`

Layout alternatif (legacy).

---

## Pages (`assets/pages/`)

| Page | Fichier | Route | Description |
|------|---------|-------|-------------|
| **Dashboard** | `Dashboard.tsx` | `/plan` | Plan de salle avec tables draggables |
| **Personnes** | `Personnes.tsx` | `/personnes` | Liste et gestion des invités |
| **Tables** | `Tables.tsx` | `/tables` | Liste et gestion des tables |
| **Evenement** | `Evenement.tsx` | `/evenement/edit` | Configuration événement |
| **Hotesse** | `Hotesse.tsx` | `/hotesse` | Interface hôtesse (standalone) |
| **Settings** | `Settings.tsx` | `/settings` | Paramètres application |

---

## Custom Hooks (`assets/hooks/`)

| Hook | Fichier | Description |
|------|---------|-------------|
| `usePersonnes` | `usePersonnes.ts` | CRUD personnes avec TanStack Query |
| `useTables` | `useTables.ts` | CRUD tables avec TanStack Query |
| `useEvenement` | `useEvenement.ts` | Gestion événement |
| `useAuth` | `useAuth.ts` | État authentification |
| `useSearchPersonnes` | `useSearchPersonnes.ts` | Recherche debounced |
| `useApiMutation` | `useApiMutation.ts` | Mutation générique avec toasts |
| `useGetMany` | `useGetMany.ts` | Fetch collection API Platform |
| `useDebounce` | `useDebounce.ts` | Debounce générique |
| `useMobile` | `use-mobile.tsx` | Détection mobile |

---

## Contexts (`assets/contexts/`)

### DialogContext
**Fichier** : `DialogContext.tsx`

Gère l'ouverture/fermeture des dialogs de manière globale.

**Hooks exposés** :
```typescript
const { openPersonneDialog, openTableDialog, closeDialog } = useDialogs();
```

---

## Types (`assets/types/`)

### Types API (`api.ts`)

```typescript
// Entités
interface Personne { ... }
interface Table { ... }
interface Evenement { ... }
interface Civilite { ... }
interface CategoriePersonne { ... }
interface CategorieTable { ... }
interface MediaObject { ... }
interface User { ... }

// Réponses API
interface PaginatedResponse<T> { ... }
interface ApiError { ... }

// Payloads
interface PersonnePayload { ... }
interface TablePayload { ... }
```

---

## Utilitaires (`assets/lib/`)

### api.ts
Client API avec protection CSRF automatique.

```typescript
import api from '@/lib/api';

// Utilisation
const data = await api.get<Personne[]>('/api/personnes');
await api.post('/api/personnes', payload);
await api.put(`/api/personnes/${id}`, payload);
await api.patch(`/api/tables/${id}`, { posX, posY });
await api.delete(`/api/personnes/${id}`);
```

### utils.ts
Fonction `cn()` pour fusion de classes Tailwind.

### query-client.ts
Configuration TanStack Query (staleTime, retries, etc.).

---

## Conventions de code

### Nommage
- **Composants** : PascalCase (`PersonCard.tsx`)
- **Hooks** : camelCase avec préfixe `use` (`usePersonnes.ts`)
- **Types** : PascalCase (`Personne`, `TablePayload`)
- **Fichiers UI** : kebab-case (`date-picker.tsx`)

### Structure d'un composant
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  // Props typées
}

export function MyComponent({ prop }: MyComponentProps) {
  return (
    <div className={cn('base-classes')}>
      {/* Content */}
    </div>
  );
}
```

### Patterns Shadcn
```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva('base-classes', {
  variants: {
    variant: {
      default: 'variant-classes',
      destructive: 'destructive-classes',
    },
    size: {
      default: 'size-default',
      sm: 'size-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});
```

---

*Généré le 2026-01-15 par le workflow document-project BMAD*
