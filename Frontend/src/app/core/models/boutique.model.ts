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

export interface Categorie {
  id: string;
  nom: string;
  icone: string;
  description: string;
}
