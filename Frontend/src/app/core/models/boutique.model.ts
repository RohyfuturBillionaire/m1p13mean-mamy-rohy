export interface Boutique {
  id: string;
  nom: string;
  type: 'boutique' | 'restaurant' | 'service';
  categorie: string;
  description: string;
  descriptionLongue: string;
  image: string;
  logo: string;
  etage: number;
  position: { x: number; y: number };
  horaires: {
    lundi: string;
    mardi: string;
    mercredi: string;
    jeudi: string;
    vendredi: string;
    samedi: string;
    dimanche: string;
  };
  telephone: string;
  email: string;
  siteWeb?: string;
  produits: Produit[];
  promotions: Promotion[];
  note: number;
  avis: number;
  tags: string[];
  nouveau: boolean;
}

export interface Produit {
  id: string;
  nom: string;
  description: string;
  prix: number;
  prixPromo?: number;
  image: string;
  categorie: string;
  disponible: boolean;
  nouveau: boolean;
}

export interface Promotion {
  id: string;
  titre: string;
  description: string;
  reduction: number;
  type: 'pourcentage' | 'montant' | 'offre';
  dateDebut: Date;
  dateFin: Date;
  image: string;
  conditions?: string;
  code?: string;
  boutiqueId: string;
  boutiqueNom: string;
  boutiqueLogo: string;
}

export interface Categorie {
  id: string;
  nom: string;
  icone: string;
  description: string;
}
