import { Produit } from './boutique.model';

export interface CartItem {
  produit: Produit;
  boutiqueId: string;
  boutiqueNom: string;
  quantite: number;
}

export interface Cart {
  items: CartItem[];
  sousTotal: number;
  tva: number;
  total: number;
}

export interface ClientInfo {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  codePostal: string;
}

export interface Commande {
  id: string;
  numeroCommande: string;
  date: Date;
  client: ClientInfo;
  items: CartItem[];
  sousTotal: number;
  tva: number;
  total: number;
  statut: 'en_attente' | 'payee' | 'livree' | 'annulee';
  methodePaiement: string;
}

export interface Facture {
  id: string;
  numeroFacture: string;
  dateEmission: Date;
  commande: Commande;
  entreprise: {
    nom: string;
    adresse: string;
    telephone: string;
    email: string;
    nif: string;
    stat: string;
  };
}
