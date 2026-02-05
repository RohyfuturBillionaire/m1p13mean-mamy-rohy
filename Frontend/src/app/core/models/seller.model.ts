// =============================================
// SELLER MODULE MODELS
// =============================================

export interface SellerUser {
  id: string;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: 'boutique';
  boutiqueId: string;
  actif: boolean;
  dateInscription: Date;
  avatar?: string;
}

export interface SellerBoutique {
  id: string;
  nom: string;
  description: string;
  descriptionLongue: string;
  logo: string;
  image: string;
  categorie: string;
  type: 'boutique' | 'restaurant' | 'service';
  etage: number;
  numeroBoutique: string;
  superficie: number;
  email: string;
  telephone: string;
  siteWeb?: string;
  horaires: {
    lundi: string;
    mardi: string;
    mercredi: string;
    jeudi: string;
    vendredi: string;
    samedi: string;
    dimanche: string;
  };
  estOuvert: boolean;
  dateOuverture: Date;
  note: number;
  avis: number;
  tags: string[];
}

export interface SellerProduit {
  id: string;
  boutiqueId: string;
  nom: string;
  description: string;
  prix: number;
  prixPromo?: number;
  categorie: string;
  image: string;
  images?: string[];
  stock: number;
  stockAlerte: number;
  statut: 'actif' | 'inactif' | 'rupture';
  nouveau: boolean;
  dateCreation: Date;
  dateModification: Date;
  vendu: number;
}

export interface StockMovement {
  id: string;
  produitId: string;
  produitNom: string;
  type: 'entree' | 'sortie' | 'ajustement';
  quantite: number;
  stockAvant: number;
  stockApres: number;
  motif: string;
  date: Date;
}

export interface SellerCommande {
  id: string;
  numeroCommande: string;
  boutiqueId: string;
  clientId: string;
  clientNom: string;
  clientEmail: string;
  clientTelephone: string;
  clientAdresse: string;
  items: {
    produitId: string;
    produitNom: string;
    produitImage: string;
    quantite: number;
    prixUnitaire: number;
    total: number;
  }[];
  sousTotal: number;
  tva: number;
  fraisLivraison: number;
  total: number;
  statut: 'en_attente' | 'payee' | 'en_preparation' | 'expediee' | 'livree' | 'annulee';
  methodePaiement: string;
  dateCommande: Date;
  dateExpedition?: Date;
  dateLivraison?: Date;
  notes?: string;
}

export interface SellerLivraison {
  id: string;
  commandeId: string;
  numeroSuivi: string;
  transporteur: string;
  statut: 'en_preparation' | 'expediee' | 'en_transit' | 'livree';
  adresseLivraison: string;
  dateExpedition: Date;
  dateEstimee: Date;
  dateLivraison?: Date;
  historique: {
    date: Date;
    statut: string;
    lieu: string;
  }[];
}

export interface SellerPromotion {
  id: string;
  boutiqueId: string;
  titre: string;
  description: string;
  type: 'pourcentage' | 'montant' | 'offre';
  valeur: number;
  code?: string;
  dateDebut: Date;
  dateFin: Date;
  conditions?: string;
  image?: string;
  statut: 'brouillon' | 'en_attente' | 'validee' | 'refusee' | 'active' | 'expiree';
  produitsApplicables?: string[];
  dateCreation: Date;
  dateSoumission?: Date;
  dateValidation?: Date;
  motifRefus?: string;
}

export interface SellerFAQ {
  id: string;
  boutiqueId: string;
  question: string;
  reponse: string;
  categorie: string;
  ordre: number;
  actif: boolean;
  dateCreation: Date;
  dateModification: Date;
}

export interface SellerMessage {
  id: string;
  conversationId: string;
  expediteurId: string;
  expediteurNom: string;
  expediteurRole: 'admin' | 'boutique' | 'client';
  contenu: string;
  date: Date;
  lu: boolean;
}

export interface SellerConversation {
  id: string;
  boutiqueId: string;
  participantId: string;
  participantNom: string;
  participantRole: 'admin' | 'client';
  sujet: string;
  dernierMessage: string;
  dateLastMessage: Date;
  nonLus: number;
}

export interface SellerNotification {
  id: string;
  boutiqueId: string;
  type: 'commande' | 'stock' | 'promotion' | 'message' | 'paiement' | 'info';
  titre: string;
  message: string;
  date: Date;
  lu: boolean;
  lien?: string;
}

export interface SellerKPI {
  id: string;
  label: string;
  valeur: number;
  unite: string;
  evolution: number;
  icon: string;
  couleur: string;
}

export interface SellerChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}
