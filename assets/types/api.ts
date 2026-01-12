/**
 * TypeScript types for API entities
 * These types match the Symfony entity structure
 */

export interface Civilite {
  id: number;
  nom: string;
}

export interface CategoriePersonne {
  id: number;
  nom: string;
}

export interface CategorieTable {
  id: number;
  nom: string;
  couleur?: string;
}

export interface MediaObject {
  id: number;
  contentUrl?: string;
  filePath?: string;
}

export interface Evenement {
  id: number;
  nom?: string;
  plan?: MediaObject;
  billetwebId?: string;
  lastUpdateBilletWeb?: string;
}

export interface Table {
  id: number;
  nom?: string;
  numero: number;
  nombrePlacesMax: number;
  posX: string;
  posY: string;
  categorie?: CategorieTable;
  personnes?: Personne[];
}

export interface Personne {
  id: number;
  nom?: string;
  prenom?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  montantBillet?: number;
  montantPaye?: number;
  dateReglement?: string;
  moyenPaiement?: string;
  commentaire?: string;
  codePostal?: string;
  ville?: string;
  present: boolean;
  idCerfa?: string;
  billetWebTicketId?: string;
  smsSended: boolean;
  categorie?: CategoriePersonne;
  table?: Table;
  conjoint?: Personne;
  civilite?: Civilite;
}

export interface User {
  id: number;
  email: string;
  roles: string[];
}

// API Response types
export interface PaginatedResponse<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
}

export interface ApiError {
  'hydra:title'?: string;
  'hydra:description'?: string;
  message?: string;
  error?: string;
}
