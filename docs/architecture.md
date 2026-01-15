# Architecture - Reservation Beth Rivkah

## Vue d'ensemble

**Reservation Beth Rivkah** est une application web **monolithique fullstack** construite avec :

- **Backend** : Symfony 6.4 + API Platform 3.x
- **Frontend** : React 18 SPA avec TypeScript
- **Base de données** : MySQL 8.0
- **Build** : Webpack Encore

## Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           NAVIGATEUR                                │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     React SPA (assets/)                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │  │
│  │  │   Pages     │  │  Components │  │    TanStack Query    │   │  │
│  │  │  (router)   │  │  (Shadcn)   │  │    (Server State)    │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘   │  │
│  │                          │                                    │  │
│  │                    ┌─────▼─────┐                              │  │
│  │                    │  api.ts   │ (Client HTTP + CSRF)         │  │
│  │                    └─────┬─────┘                              │  │
│  └──────────────────────────┼────────────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────────┘
                              │ HTTP/REST (JSON)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SYMFONY 6.4                                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    API Platform 3.x                           │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  /api/personnes    /api/tables    /api/evenements      │  │  │
│  │  │  /api/civilites    /api/categorie_*                    │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                  Contrôleurs personnalisés                    │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌────────────────────────┐│  │
│  │  │ BilletWeb    │ │    SMS       │ │   Export/PDF           ││  │
│  │  │ Controller   │ │  Controller  │ │   Controllers          ││  │
│  │  └──────┬───────┘ └──────┬───────┘ └────────────────────────┘│  │
│  └─────────┼────────────────┼────────────────────────────────────┘  │
│            │                │                                       │
│  ┌─────────▼────────────────▼─────────────────────────────────────┐ │
│  │                      Services                                  │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │ │
│  │  │ BilletWebService │  │   SmsService     │  │ UtilsService │ │ │
│  │  │   (Guzzle)       │  │   (OVH API)      │  │              │ │ │
│  │  └────────┬─────────┘  └────────┬─────────┘  └──────────────┘ │ │
│  └───────────┼──────────────────────┼────────────────────────────┘  │
│              │                      │                               │
│  ┌───────────▼──────────────────────▼───────────────────────────┐   │
│  │                    Doctrine ORM                              │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  Personne | Table | Evenement | MediaObject | User     │ │   │
│  │  │  CategoriePersonne | CategorieTable | Civilite         │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         MySQL 8.0                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  personne | table | evenement | media_object | user           │  │
│  │  categorie_personne | categorie_table | civilite              │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP
┌─────────────────────────────┼───────────────────────────────────────┐
│           SERVICES EXTERNES │                                       │
│  ┌──────────────────────────▼─────────────────────────────────────┐ │
│  │                   BilletWeb API                                │ │
│  │            (Synchronisation billetterie)                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      OVH SMS API                               │ │
│  │              (Notifications SMS invités)                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Patterns architecturaux

### Backend : Architecture en couches

```
┌────────────────────────┐
│      Controllers       │  ← Endpoints HTTP, validation entrée
├────────────────────────┤
│       Services         │  ← Logique métier, intégrations
├────────────────────────┤
│     Repositories       │  ← Accès données, requêtes
├────────────────────────┤
│       Entities         │  ← Modèle de domaine
├────────────────────────┤
│      Doctrine ORM      │  ← Persistence
└────────────────────────┘
```

### Frontend : Component-Based Architecture

```
┌────────────────────────┐
│         Pages          │  ← Routes, mise en page
├────────────────────────┤
│   Feature Components   │  ← Logique métier UI
├────────────────────────┤
│     UI Components      │  ← Composants réutilisables (Shadcn)
├────────────────────────┤
│    Hooks (State)       │  ← Gestion état (TanStack Query)
├────────────────────────┤
│      API Client        │  ← Communication serveur
└────────────────────────┘
```

## Flux de données

### 1. Chargement initial (exemple : liste des tables)

```
1. Page Dashboard monte
2. Hook useTables() appelé
3. TanStack Query vérifie le cache
4. Si cache miss → api.get('/api/tables')
5. Client API ajoute headers + CSRF
6. API Platform reçoit la requête
7. Doctrine charge les entités Table + Personnes
8. Normalizer sérialise en JSON-LD
9. Response renvoyée au frontend
10. TanStack Query met en cache
11. Composant re-render avec données
```

### 2. Mutation (exemple : mise à jour présence)

```
1. Utilisateur clique checkbox présence
2. Hook useUpdatePresence() appelé
3. api.put('/api/personnes/{id}/update-presence', data)
4. UpdatePresenceController reçoit
5. Si withSms=true → SmsService.sendSms()
6. Personne entity mise à jour
7. Doctrine flush()
8. Response avec entité mise à jour
9. TanStack Query invalide le cache ['personnes']
10. Composants concernés re-fetchent
```

### 3. Synchronisation BilletWeb

```
1. Utilisateur clique "Synchroniser"
2. api.post('/api/billet-web/sync')
3. BilletWebController appelé
4. Charge l'événement courant
5. BilletWebService appelle API externe
6. Parse les participants reçus
7. Pour chaque participant :
   - Vérifie si existe (email + nom)
   - Crée ou met à jour Personne
8. Doctrine flush() par batch
9. Response avec compteur
```

## Sécurité

### Authentification

- **Type** : Session-based (form login)
- **Provider** : Doctrine entity (User)
- **Stockage session** : Fichier (var/sessions) ou Redis en prod

### Autorisation

```yaml
# Hiérarchie des rôles
ROLE_ADMIN: ROLE_USER

# Access control
- { path: ^/login, roles: PUBLIC_ACCESS }
- { path: ^/api, roles: ROLE_USER }
- { path: ^/, roles: ROLE_ADMIN }
```

### Protection CSRF

```
1. Serveur génère token → cookie XSRF-TOKEN
2. Frontend lit le cookie
3. Frontend envoie dans header X-XSRF-TOKEN
4. CsrfApiListener vérifie la correspondance
```

## Gestion d'état

### Server State (TanStack Query)

```typescript
// Définition des clés de cache
export const personneKeys = {
  all: ['personnes'] as const,
  lists: () => [...personneKeys.all, 'list'] as const,
  list: (params) => [...personneKeys.lists(), params] as const,
  detail: (id) => [...personneKeys.all, 'detail', id] as const,
};

// Invalidation après mutation
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: personneKeys.lists() });
}
```

### Client State (React Context)

```typescript
// DialogContext pour gestion globale des modales
const { openPersonneDialog, closeDialog } = useDialogs();
```

## Performance

### Backend

- **Index BDD** sur nom, email, telephone de Personne
- **Eager loading** sur relations fréquemment utilisées
- **Pagination désactivée** (petits volumes de données)

### Frontend

- **Code splitting** via React Router lazy loading
- **Cache TanStack Query** avec staleTime configuré
- **Debounce** sur la recherche (300ms)
- **Memoization** avec useMemo/useCallback

## Scalabilité

### Points d'amélioration potentiels

1. **Cache Redis** pour les sessions et query cache Doctrine
2. **Queue jobs** pour l'envoi SMS (Symfony Messenger)
3. **CDN** pour les assets statiques
4. **Read replicas** MySQL si volume augmente

### Limites actuelles

- Application single-tenant (un seul événement)
- Pas de pagination côté API (ok pour ~1000 invités)
- SMS envoyés de manière synchrone

## Monitoring

### Logs

- **Symfony Monolog** : logs applicatifs
- **Docker logs** : logs infrastructure

### Erreurs

- Erreurs API loguées avec contexte
- Erreurs BilletWeb/OVH capturées et loguées

---

*Généré le 2026-01-15 par le workflow document-project BMAD*
