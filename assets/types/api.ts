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

/** Table shape types */
export type TableShape = 'circle' | 'oval' | 'rectangle' | 'rounded-rectangle';

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
  shape: TableShape;
  width: string;
  height: string;
  rotation: string;
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

/**
 * API Payload types for create/update operations
 * These use IRI format for relations (e.g., "/api/civilites/1")
 */

/** IRI reference format used by API Platform */
export type IRI = string | null;

/** Payload for creating or updating a Personne */
export interface PersonnePayload {
  [key: string]: string | number | boolean | null | undefined;
  nom: string;
  prenom?: string | null;
  email: string;
  telephone?: string | null;
  adresse?: string | null;
  codePostal?: string | null;
  ville?: string | null;
  montantBillet?: string | null;
  montantPaye?: string | null;
  dateReglement?: string | null;
  moyenPaiement?: string | null;
  commentaire?: string | null;
  present?: boolean;
  civilite?: IRI;
  categorie?: IRI;
  table?: IRI;
  conjoint?: IRI;
}

/** Payload for creating or updating a Table */
export interface TablePayload {
  [key: string]: string | number | boolean | null | undefined;
  nom?: string | null;
  numero: number;
  nombrePlacesMax: number;
  posX: string;
  posY: string;
  shape?: string | null;
  width?: string | null;
  height?: string | null;
  rotation?: string | null;
  categorie?: IRI;
}

/** Payload for creating or updating a CategorieTable */
export interface CategorieTablePayload {
  nom: string;
  couleur: string;
}
