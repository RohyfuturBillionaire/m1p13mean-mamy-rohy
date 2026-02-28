// Models for Admin Module

export interface Role {
  _id: string;
  role_name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Achat {
  article_id: string;
  prix: number;
  quantite: number;
  date_achat: Date;
}

export interface UserDB {
  _id: string;
  username: string;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  id_role: Role | string;
  article_souhait: string[];
  boutique_favoris: string[];
  achat: Achat[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'admin' | 'boutique' | 'client';
  avatar?: string;
  dateInscription: Date;
  actif: boolean;
}

export interface Contrat {
  id: string;
  boutiqueId: string;
  clientId: string;
  nomClient: string;
  nomEntreprise: string;
  dateDebut: Date;
  dateFin: Date;
  loyerMensuel: number;
  surface: number;
  etage: number;
  numero: string;
  statut: 'actif' | 'expire' | 'resilie';
}

export interface Paiement {
  id: string;
  contratId: string;
  boutiqueNom: string;
  montant: number;
  datePaiement: Date;
  dateEcheance: Date;
  statut: 'paye' | 'en_attente' | 'en_retard';
  mois: string;
  annee: number;
}

export interface Facture {
  id: string;
  numero: string;
  contratId: string;
  boutiqueNom: string;
  clientNom: string;
  montant: number;
  tva: number;
  total: number;
  dateEmission: Date;
  dateEcheance: Date;
  statut: 'payee' | 'en_attente' | 'en_retard';
}

export interface DemandePromotion {
  id: string;
  boutiqueId: string;
  boutiqueNom: string;
  titre: string;
  description: string;
  reduction: number;
  dateDebut: Date;
  dateFin: Date;
  image?: string;
  statut: 'en_attente' | 'validee' | 'refusee';
  dateDemande: Date;
  montantPub?: number;
}

export interface Message {
  id: string;
  expediteurId: string;
  expediteurNom: string;
  expediteurRole: 'admin' | 'boutique' | 'client';
  destinataireId: string;
  destinataireNom: string;
  contenu: string;
  dateEnvoi: Date;
  lu: boolean;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    nom: string;
    role: 'admin' | 'boutique' | 'client';
    avatar?: string;
  }[];
  dernierMessage: string;
  dateModification: Date;
  nonLus: number;
}

export interface KPI {
  label: string;
  value: number | string;
  change?: number;
  icon: string;
  color: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}
