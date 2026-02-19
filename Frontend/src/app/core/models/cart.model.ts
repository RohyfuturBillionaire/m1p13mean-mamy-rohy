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

// ===== API Models =====

export interface CommandeArticleApi {
  id_article: string;
  nom: string;
  prix: number;
  quantite: number;
}

export interface CommandeApi {
  _id: string;
  articles: CommandeArticleApi[];
  type_livraison: string;
  status: 'EN_ATTENTE' | 'VALIDEE' | 'EN_PREPARATION' | 'EXPEDIEE' | 'LIVREE' | 'ANNULEE';
  id_client: any;
  total: number;
  id_boutique: any;
  date_commande: string;
  numero_commande: string;
  methode_paiement: string;
  client_nom: string;
  client_email: string;
  client_telephone: string;
  client_adresse: string;
}

export interface CheckoutPayload {
  methodePaiement: string;
  clientNom: string;
  clientEmail: string;
  clientTelephone: string;
  clientAdresse: string;
  typeLivraison?: string;
  lieuLivraison?: string;
}

export interface BoutiqueStats {
  totalRevenu: number;
  totalArticlesVendus: number;
  nbCommandes: number;
  monthly: { year: number; month: number; revenu: number; nbCommandes: number }[];
  bestSellers: { _id: string; nom: string; totalVendu: number; revenu: number }[];
}
