// Models for Admin Module

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

export interface Notification {
  id: string;
  type: 'paiement' | 'demande' | 'alerte' | 'info';
  titre: string;
  message: string;
  date: Date;
  lu: boolean;
  lien?: string;
}

export interface ParametresSite {
  nomCentre: string;
  slogan: string;
  logo?: string;
  couleurPrimaire: string;
  couleurSecondaire: string;
  email: string;
  telephone: string;
  adresse: string;
  horaires: {
    semaine: string;
    weekend: string;
  };
  sectionsActives: {
    promotions: boolean;
    map: boolean;
    boutiques: boolean;
    evenements: boolean;
  };
  modeMaintenace: boolean;
  inscriptionOuverte: boolean;
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
