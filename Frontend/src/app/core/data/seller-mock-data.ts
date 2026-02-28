import {
  SellerUser,
  SellerBoutique,
  SellerProduit,
  StockMovement,
  SellerCommande,
  SellerLivraison,
  SellerPromotion,
  SellerFAQ,
  SellerConversation,
  SellerMessage,
  SellerKPI,
  SellerChartData
} from '../models/seller.model';

// =============================================
// SELLER USER
// =============================================
export const MOCK_SELLER_USER: SellerUser = {
  id: 'seller-1',
  username: 'boutique',
  email: 'boutique@tanacenter.mg',
  nom: 'Rakoto',
  prenom: 'Jean',
  telephone: '+261 34 12 345 67',
  role: 'boutique',
  boutiqueId: 'b1',
  actif: true,
  dateInscription: new Date('2023-06-15'),
  avatar: 'https://ui-avatars.com/api/?name=Jean+Rakoto&background=C9A962&color=fff'
};

// =============================================
// SELLER BOUTIQUE
// =============================================
export const MOCK_SELLER_BOUTIQUE: SellerBoutique = {
  id: 'b1',
  nom: 'Mode Élégance',
  description: 'Boutique de prêt-à-porter haut de gamme pour hommes et femmes',
  descriptionLongue: 'Mode Élégance vous propose une sélection raffinée de vêtements et accessoires de créateurs. Notre équipe de stylistes vous accompagne pour trouver les pièces parfaites qui sublimeront votre style. Nous privilégions les matières nobles et les coupes impeccables pour une élégance au quotidien.',
  logo: 'https://ui-avatars.com/api/?name=Mode+Elegance&background=1a1a2e&color=C9A962&size=128',
  image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
  categorie: 'mode',
  type: 'boutique',
  etage: 1,
  numeroBoutique: 'A-12',
  superficie: 85,
  email: 'contact@mode-elegance.mg',
  telephone: '+261 34 12 345 67',
  siteWeb: 'https://mode-elegance.mg',
  horaires: {
    lundi: '09:00 - 20:00',
    mardi: '09:00 - 20:00',
    mercredi: '09:00 - 20:00',
    jeudi: '09:00 - 20:00',
    vendredi: '09:00 - 21:00',
    samedi: '09:00 - 21:00',
    dimanche: '10:00 - 18:00'
  },
  estOuvert: true,
  dateOuverture: new Date('2023-06-15'),
  note: 4.8,
  avis: 156,
  tags: ['Mode', 'Luxe', 'Prêt-à-porter', 'Accessoires']
};

// =============================================
// SELLER PRODUCTS
// =============================================
export const MOCK_SELLER_PRODUITS: SellerProduit[] = [
  {
    id: 'p1',
    boutiqueId: 'b1',
    nom: 'Robe de Soirée Élégante',
    description: 'Robe longue en soie avec broderies délicates',
    prix: 450000,
    prixPromo: 380000,
    categorie: 'Robes',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    stock: 12,
    stockAlerte: 5,
    statut: 'actif',
    nouveau: true,
    dateCreation: new Date('2024-01-15'),
    dateModification: new Date('2024-01-20'),
    vendu: 28
  },
  {
    id: 'p2',
    boutiqueId: 'b1',
    nom: 'Costume Italien',
    description: 'Costume trois pièces en laine fine italienne',
    prix: 850000,
    categorie: 'Costumes',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
    stock: 8,
    stockAlerte: 3,
    statut: 'actif',
    nouveau: false,
    dateCreation: new Date('2023-11-10'),
    dateModification: new Date('2024-01-05'),
    vendu: 45
  },
  {
    id: 'p3',
    boutiqueId: 'b1',
    nom: 'Sac à Main Cuir',
    description: 'Sac à main en cuir véritable avec finitions dorées',
    prix: 320000,
    categorie: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
    stock: 2,
    stockAlerte: 5,
    statut: 'actif',
    nouveau: false,
    dateCreation: new Date('2023-09-20'),
    dateModification: new Date('2024-01-18'),
    vendu: 67
  },
  {
    id: 'p4',
    boutiqueId: 'b1',
    nom: 'Chemise en Lin',
    description: 'Chemise décontractée en lin naturel',
    prix: 125000,
    categorie: 'Chemises',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
    stock: 25,
    stockAlerte: 10,
    statut: 'actif',
    nouveau: true,
    dateCreation: new Date('2024-01-10'),
    dateModification: new Date('2024-01-10'),
    vendu: 15
  },
  {
    id: 'p5',
    boutiqueId: 'b1',
    nom: 'Montre Classic Gold',
    description: 'Montre automatique avec bracelet en cuir',
    prix: 1200000,
    prixPromo: 980000,
    categorie: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
    stock: 0,
    stockAlerte: 2,
    statut: 'rupture',
    nouveau: false,
    dateCreation: new Date('2023-08-15'),
    dateModification: new Date('2024-01-22'),
    vendu: 23
  },
  {
    id: 'p6',
    boutiqueId: 'b1',
    nom: 'Veste en Cachemire',
    description: 'Veste légère 100% cachemire',
    prix: 680000,
    categorie: 'Vestes',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
    stock: 6,
    stockAlerte: 3,
    statut: 'actif',
    nouveau: false,
    dateCreation: new Date('2023-10-05'),
    dateModification: new Date('2024-01-12'),
    vendu: 34
  },
  {
    id: 'p7',
    boutiqueId: 'b1',
    nom: 'Pantalon Chino',
    description: 'Pantalon chino coupe slim',
    prix: 95000,
    categorie: 'Pantalons',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
    stock: 18,
    stockAlerte: 8,
    statut: 'actif',
    nouveau: false,
    dateCreation: new Date('2023-07-20'),
    dateModification: new Date('2024-01-08'),
    vendu: 89
  },
  {
    id: 'p8',
    boutiqueId: 'b1',
    nom: 'Écharpe Soie Imprimée',
    description: 'Écharpe en soie avec motifs exclusifs',
    prix: 180000,
    categorie: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400',
    stock: 4,
    stockAlerte: 5,
    statut: 'actif',
    nouveau: true,
    dateCreation: new Date('2024-01-08'),
    dateModification: new Date('2024-01-08'),
    vendu: 12
  }
];

// =============================================
// STOCK MOVEMENTS
// =============================================
export const MOCK_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'sm1',
    produitId: 'p1',
    produitNom: 'Robe de Soirée Élégante',
    type: 'entree',
    quantite: 20,
    stockAvant: 0,
    stockApres: 20,
    motif: 'Réception commande fournisseur',
    date: new Date('2024-01-15')
  },
  {
    id: 'sm2',
    produitId: 'p1',
    produitNom: 'Robe de Soirée Élégante',
    type: 'sortie',
    quantite: 8,
    stockAvant: 20,
    stockApres: 12,
    motif: 'Ventes clients',
    date: new Date('2024-01-18')
  },
  {
    id: 'sm3',
    produitId: 'p3',
    produitNom: 'Sac à Main Cuir',
    type: 'sortie',
    quantite: 5,
    stockAvant: 7,
    stockApres: 2,
    motif: 'Ventes clients',
    date: new Date('2024-01-20')
  },
  {
    id: 'sm4',
    produitId: 'p5',
    produitNom: 'Montre Classic Gold',
    type: 'sortie',
    quantite: 3,
    stockAvant: 3,
    stockApres: 0,
    motif: 'Ventes clients - Rupture de stock',
    date: new Date('2024-01-22')
  },
  {
    id: 'sm5',
    produitId: 'p7',
    produitNom: 'Pantalon Chino',
    type: 'entree',
    quantite: 30,
    stockAvant: 8,
    stockApres: 38,
    motif: 'Réapprovisionnement',
    date: new Date('2024-01-10')
  },
  {
    id: 'sm6',
    produitId: 'p7',
    produitNom: 'Pantalon Chino',
    type: 'sortie',
    quantite: 20,
    stockAvant: 38,
    stockApres: 18,
    motif: 'Ventes clients',
    date: new Date('2024-01-21')
  },
  {
    id: 'sm7',
    produitId: 'p2',
    produitNom: 'Costume Italien',
    type: 'ajustement',
    quantite: -2,
    stockAvant: 10,
    stockApres: 8,
    motif: 'Inventaire - Articles défectueux',
    date: new Date('2024-01-19')
  }
];

// =============================================
// SELLER ORDERS
// =============================================
export const MOCK_SELLER_COMMANDES: SellerCommande[] = [
  {
    id: 'cmd1',
    numeroCommande: 'TC240125-0001',
    boutiqueId: 'b1',
    clientId: 'c1',
    clientNom: 'Marie Andria',
    clientEmail: 'marie.andria@email.mg',
    clientTelephone: '+261 34 56 789 01',
    clientAdresse: 'Lot IVG 123, Analakely, Antananarivo 101',
    items: [
      { produitId: 'p1', produitNom: 'Robe de Soirée Élégante', produitImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100', quantite: 1, prixUnitaire: 380000, total: 380000 },
      { produitId: 'p3', produitNom: 'Sac à Main Cuir', produitImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100', quantite: 1, prixUnitaire: 320000, total: 320000 }
    ],
    sousTotal: 700000,
    tva: 140000,
    fraisLivraison: 0,
    total: 840000,
    statut: 'livree',
    methodePaiement: 'MVola',
    dateCommande: new Date('2024-01-20'),
    dateExpedition: new Date('2024-01-21'),
    dateLivraison: new Date('2024-01-23')
  },
  {
    id: 'cmd2',
    numeroCommande: 'TC240125-0002',
    boutiqueId: 'b1',
    clientId: 'c2',
    clientNom: 'Paul Rabe',
    clientEmail: 'paul.rabe@email.mg',
    clientTelephone: '+261 33 12 345 67',
    clientAdresse: 'Villa 45, Ivandry, Antananarivo 101',
    items: [
      { produitId: 'p2', produitNom: 'Costume Italien', produitImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=100', quantite: 1, prixUnitaire: 850000, total: 850000 }
    ],
    sousTotal: 850000,
    tva: 170000,
    fraisLivraison: 15000,
    total: 1035000,
    statut: 'expediee',
    methodePaiement: 'Carte bancaire',
    dateCommande: new Date('2024-01-24'),
    dateExpedition: new Date('2024-01-25')
  },
  {
    id: 'cmd3',
    numeroCommande: 'TC240125-0003',
    boutiqueId: 'b1',
    clientId: 'c3',
    clientNom: 'Sophie Lala',
    clientEmail: 'sophie.lala@email.mg',
    clientTelephone: '+261 32 98 765 43',
    clientAdresse: 'Immeuble Star, Ankorondrano, Antananarivo 101',
    items: [
      { produitId: 'p4', produitNom: 'Chemise en Lin', produitImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100', quantite: 3, prixUnitaire: 125000, total: 375000 },
      { produitId: 'p7', produitNom: 'Pantalon Chino', produitImage: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=100', quantite: 2, prixUnitaire: 95000, total: 190000 }
    ],
    sousTotal: 565000,
    tva: 113000,
    fraisLivraison: 0,
    total: 678000,
    statut: 'en_preparation',
    methodePaiement: 'MVola',
    dateCommande: new Date('2024-01-25')
  },
  {
    id: 'cmd4',
    numeroCommande: 'TC240125-0004',
    boutiqueId: 'b1',
    clientId: 'c4',
    clientNom: 'Hery Nomena',
    clientEmail: 'hery.nomena@email.mg',
    clientTelephone: '+261 34 11 222 33',
    clientAdresse: 'Lot 89, Ambohitrarahaba, Antananarivo 103',
    items: [
      { produitId: 'p6', produitNom: 'Veste en Cachemire', produitImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100', quantite: 1, prixUnitaire: 680000, total: 680000 }
    ],
    sousTotal: 680000,
    tva: 136000,
    fraisLivraison: 20000,
    total: 836000,
    statut: 'payee',
    methodePaiement: 'Airtel Money',
    dateCommande: new Date('2024-01-25'),
    notes: 'Livraison express demandée'
  },
  {
    id: 'cmd5',
    numeroCommande: 'TC240125-0005',
    boutiqueId: 'b1',
    clientId: 'c5',
    clientNom: 'Fanja Razafy',
    clientEmail: 'fanja.razafy@email.mg',
    clientTelephone: '+261 33 44 555 66',
    clientAdresse: 'Résidence Colbert, Antaninarenina, Antananarivo 101',
    items: [
      { produitId: 'p8', produitNom: 'Écharpe Soie Imprimée', produitImage: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=100', quantite: 2, prixUnitaire: 180000, total: 360000 }
    ],
    sousTotal: 360000,
    tva: 72000,
    fraisLivraison: 0,
    total: 432000,
    statut: 'en_attente',
    methodePaiement: 'Paiement sur place',
    dateCommande: new Date('2024-01-26')
  }
];

// =============================================
// SELLER DELIVERIES
// =============================================
export const MOCK_SELLER_LIVRAISONS: SellerLivraison[] = [
  {
    id: 'liv1',
    commandeId: 'cmd1',
    numeroSuivi: 'TC-LIV-2024-0001',
    transporteur: 'Tana Express',
    statut: 'livree',
    adresseLivraison: 'Lot IVG 123, Analakely, Antananarivo 101',
    dateExpedition: new Date('2024-01-21'),
    dateEstimee: new Date('2024-01-23'),
    dateLivraison: new Date('2024-01-23'),
    historique: [
      { date: new Date('2024-01-21T10:00:00'), statut: 'Colis pris en charge', lieu: 'Tana Center' },
      { date: new Date('2024-01-21T14:00:00'), statut: 'En transit', lieu: 'Dépôt central' },
      { date: new Date('2024-01-22T09:00:00'), statut: 'En cours de livraison', lieu: 'Analakely' },
      { date: new Date('2024-01-23T11:30:00'), statut: 'Livré', lieu: 'Analakely' }
    ]
  },
  {
    id: 'liv2',
    commandeId: 'cmd2',
    numeroSuivi: 'TC-LIV-2024-0002',
    transporteur: 'Tana Express',
    statut: 'en_transit',
    adresseLivraison: 'Villa 45, Ivandry, Antananarivo 101',
    dateExpedition: new Date('2024-01-25'),
    dateEstimee: new Date('2024-01-27'),
    historique: [
      { date: new Date('2024-01-25T09:00:00'), statut: 'Colis pris en charge', lieu: 'Tana Center' },
      { date: new Date('2024-01-25T15:00:00'), statut: 'En transit', lieu: 'Dépôt central' }
    ]
  }
];

// =============================================
// SELLER PROMOTIONS
// =============================================
export const MOCK_SELLER_PROMOTIONS: SellerPromotion[] = [
  {
    id: 'promo1',
    boutiqueId: 'b1',
    titre: 'Soldes d\'Hiver',
    description: '-20% sur toutes les robes',
    type: 'pourcentage',
    valeur: 20,
    code: 'HIVER24',
    dateDebut: new Date('2024-01-15'),
    dateFin: new Date('2024-02-15'),
    conditions: 'Valable sur toutes les robes, non cumulable',
    image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400',
    statut: 'active',
    produitsApplicables: ['p1'],
    dateCreation: new Date('2024-01-10'),
    dateSoumission: new Date('2024-01-11'),
    dateValidation: new Date('2024-01-12')
  },
  {
    id: 'promo2',
    boutiqueId: 'b1',
    titre: 'Offre Montre Luxe',
    description: '-18% sur la montre Classic Gold',
    type: 'pourcentage',
    valeur: 18,
    dateDebut: new Date('2024-01-20'),
    dateFin: new Date('2024-02-20'),
    statut: 'active',
    produitsApplicables: ['p5'],
    dateCreation: new Date('2024-01-18'),
    dateSoumission: new Date('2024-01-18'),
    dateValidation: new Date('2024-01-19')
  },
  {
    id: 'promo3',
    boutiqueId: 'b1',
    titre: 'Saint-Valentin',
    description: '-30% sur les accessoires',
    type: 'pourcentage',
    valeur: 30,
    code: 'LOVE24',
    dateDebut: new Date('2024-02-10'),
    dateFin: new Date('2024-02-14'),
    conditions: 'Accessoires uniquement',
    statut: 'en_attente',
    dateCreation: new Date('2024-01-25'),
    dateSoumission: new Date('2024-01-25')
  },
  {
    id: 'promo4',
    boutiqueId: 'b1',
    titre: 'Livraison Gratuite',
    description: 'Livraison offerte dès 500 000 Ar',
    type: 'offre',
    valeur: 0,
    dateDebut: new Date('2024-01-01'),
    dateFin: new Date('2024-12-31'),
    conditions: 'Minimum 500 000 Ar d\'achat',
    statut: 'active',
    dateCreation: new Date('2023-12-20'),
    dateSoumission: new Date('2023-12-20'),
    dateValidation: new Date('2023-12-21')
  }
];

// =============================================
// SELLER FAQ
// =============================================
export const MOCK_SELLER_FAQ: SellerFAQ[] = [
  {
    id: 'faq1',
    boutiqueId: 'b1',
    question: 'Quels sont vos délais de livraison ?',
    reponse: 'Nous livrons généralement sous 2 à 3 jours ouvrables dans Antananarivo. Pour les autres régions, comptez 5 à 7 jours.',
    categorie: 'Livraison',
    ordre: 1,
    actif: true,
    dateCreation: new Date('2023-06-20'),
    dateModification: new Date('2024-01-10')
  },
  {
    id: 'faq2',
    boutiqueId: 'b1',
    question: 'Acceptez-vous les retours ?',
    reponse: 'Oui, vous disposez de 14 jours pour retourner un article non porté avec son étiquette. Le remboursement ou l\'échange sera effectué sous 5 jours.',
    categorie: 'Retours',
    ordre: 2,
    actif: true,
    dateCreation: new Date('2023-06-20'),
    dateModification: new Date('2023-09-15')
  },
  {
    id: 'faq3',
    boutiqueId: 'b1',
    question: 'Proposez-vous des retouches ?',
    reponse: 'Oui, nous offrons un service de retouches gratuit pour tout achat supérieur à 200 000 Ar. Contactez-nous en boutique.',
    categorie: 'Services',
    ordre: 3,
    actif: true,
    dateCreation: new Date('2023-07-10'),
    dateModification: new Date('2023-07-10')
  },
  {
    id: 'faq4',
    boutiqueId: 'b1',
    question: 'Comment puis-je suivre ma commande ?',
    reponse: 'Un numéro de suivi vous est envoyé par email dès l\'expédition. Vous pouvez suivre votre colis en temps réel sur notre site ou via l\'application.',
    categorie: 'Livraison',
    ordre: 4,
    actif: true,
    dateCreation: new Date('2023-08-05'),
    dateModification: new Date('2024-01-05')
  },
  {
    id: 'faq5',
    boutiqueId: 'b1',
    question: 'Quels moyens de paiement acceptez-vous ?',
    reponse: 'Nous acceptons MVola, Airtel Money, Orange Money, les cartes bancaires (Visa, Mastercard) et le paiement en espèces à la boutique.',
    categorie: 'Paiement',
    ordre: 5,
    actif: true,
    dateCreation: new Date('2023-06-20'),
    dateModification: new Date('2023-06-20')
  }
];

// =============================================
// SELLER CONVERSATIONS
// =============================================
export const MOCK_SELLER_CONVERSATIONS: SellerConversation[] = [
  {
    id: 'conv1',
    boutiqueId: 'b1',
    participantId: 'admin-1',
    participantNom: 'Administration Tana Center',
    participantRole: 'admin',
    sujet: 'Validation promotion Saint-Valentin',
    dernierMessage: 'Votre demande de promotion est en cours de validation.',
    dateLastMessage: new Date('2024-01-25T14:30:00'),
    nonLus: 1
  },
  {
    id: 'conv2',
    boutiqueId: 'b1',
    participantId: 'c1',
    participantNom: 'Marie Andria',
    participantRole: 'client',
    sujet: 'Question sur ma commande TC240125-0001',
    dernierMessage: 'Merci pour votre retour rapide !',
    dateLastMessage: new Date('2024-01-23T16:45:00'),
    nonLus: 0
  },
  {
    id: 'conv3',
    boutiqueId: 'b1',
    participantId: 'c4',
    participantNom: 'Hery Nomena',
    participantRole: 'client',
    sujet: 'Demande livraison express',
    dernierMessage: 'Pouvez-vous confirmer la livraison express ?',
    dateLastMessage: new Date('2024-01-25T18:20:00'),
    nonLus: 2
  }
];

// =============================================
// SELLER MESSAGES
// =============================================
export const MOCK_SELLER_MESSAGES: SellerMessage[] = [
  {
    id: 'msg1',
    conversationId: 'conv1',
    expediteurId: 'seller-1',
    expediteurNom: 'Mode Élégance',
    expediteurRole: 'boutique',
    contenu: 'Bonjour, je souhaite soumettre une nouvelle promotion pour la Saint-Valentin.',
    date: new Date('2024-01-25T10:00:00'),
    lu: true
  },
  {
    id: 'msg2',
    conversationId: 'conv1',
    expediteurId: 'admin-1',
    expediteurNom: 'Administration Tana Center',
    expediteurRole: 'admin',
    contenu: 'Bonjour, votre demande de promotion est en cours de validation. Nous vous recontacterons sous 48h.',
    date: new Date('2024-01-25T14:30:00'),
    lu: false
  },
  {
    id: 'msg3',
    conversationId: 'conv2',
    expediteurId: 'c1',
    expediteurNom: 'Marie Andria',
    expediteurRole: 'client',
    contenu: 'Bonjour, j\'ai bien reçu ma commande. Merci !',
    date: new Date('2024-01-23T16:45:00'),
    lu: true
  },
  {
    id: 'msg4',
    conversationId: 'conv3',
    expediteurId: 'c4',
    expediteurNom: 'Hery Nomena',
    expediteurRole: 'client',
    contenu: 'Bonjour, j\'aimerais savoir si une livraison express est possible pour ma commande ?',
    date: new Date('2024-01-25T17:00:00'),
    lu: true
  },
  {
    id: 'msg5',
    conversationId: 'conv3',
    expediteurId: 'c4',
    expediteurNom: 'Hery Nomena',
    expediteurRole: 'client',
    contenu: 'Pouvez-vous confirmer la livraison express ?',
    date: new Date('2024-01-25T18:20:00'),
    lu: false
  }
];

// =============================================
// SELLER KPIs
// =============================================
export const MOCK_SELLER_KPIS: SellerKPI[] = [
  {
    id: 'kpi1',
    label: 'Chiffre d\'affaires',
    valeur: 4821000,
    unite: 'Ar',
    evolution: 12.5,
    icon: 'payments',
    couleur: '#C9A962'
  },
  {
    id: 'kpi2',
    label: 'Commandes',
    valeur: 47,
    unite: '',
    evolution: 8.3,
    icon: 'shopping_bag',
    couleur: '#4CAF50'
  },
  {
    id: 'kpi3',
    label: 'Visiteurs',
    valeur: 1234,
    unite: '',
    evolution: 15.2,
    icon: 'visibility',
    couleur: '#2196F3'
  },
  {
    id: 'kpi4',
    label: 'Produits vendus',
    valeur: 312,
    unite: '',
    evolution: -2.1,
    icon: 'inventory_2',
    couleur: '#FF9800'
  }
];

// =============================================
// CHART DATA
// =============================================
export const MOCK_VENTES_MENSUELLES: SellerChartData = {
  labels: ['Août', 'Sept', 'Oct', 'Nov', 'Déc', 'Jan'],
  datasets: [{
    label: 'Ventes (Ar)',
    data: [3200000, 3800000, 4100000, 4500000, 5200000, 4821000],
    backgroundColor: '#C9A962',
    borderColor: '#C9A962'
  }]
};

export const MOCK_BEST_SELLERS: SellerChartData = {
  labels: ['Pantalon Chino', 'Sac à Main Cuir', 'Costume Italien', 'Veste Cachemire', 'Robe Soirée'],
  datasets: [{
    label: 'Unités vendues',
    data: [89, 67, 45, 34, 28],
    backgroundColor: ['#C9A962', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0']
  }]
};

export const MOCK_COMMANDES_VS_LIVRAISONS: SellerChartData = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [
    {
      label: 'Commandes',
      data: [8, 12, 9, 15, 11, 18, 6],
      backgroundColor: '#C9A962'
    },
    {
      label: 'Livraisons',
      data: [6, 10, 8, 12, 9, 14, 4],
      backgroundColor: '#4CAF50'
    }
  ]
};

export const MOCK_STOCK_STATUS: SellerChartData = {
  labels: ['Stock OK', 'Stock faible', 'Rupture'],
  datasets: [{
    label: 'Produits',
    data: [5, 2, 1],
    backgroundColor: ['#4CAF50', '#FF9800', '#f44336']
  }]
};

// Product Categories for filters
export const PRODUCT_CATEGORIES = [
  'Robes', 'Costumes', 'Accessoires', 'Chemises', 'Vestes', 'Pantalons'
];

// FAQ Categories
export const FAQ_CATEGORIES = [
  'Livraison', 'Retours', 'Services', 'Paiement', 'Général'
];
