import { Boutique, Categorie, Promotion } from '../models/boutique.model';

export const CATEGORIES: Categorie[] = [
  { id: 'mode', nom: 'Mode & Accessoires', icone: 'shopping_bag', description: 'Vêtements, chaussures et accessoires' },
  { id: 'beaute', nom: 'Beauté & Bien-être', icone: 'spa', description: 'Cosmétiques, parfums et soins' },
  { id: 'restauration', nom: 'Restauration', icone: 'restaurant', description: 'Restaurants et cafés' },
  { id: 'electronique', nom: 'Électronique', icone: 'devices', description: 'High-tech et multimédia' },
  { id: 'maison', nom: 'Maison & Décoration', icone: 'home', description: 'Mobilier et décoration' },
  { id: 'bijouterie', nom: 'Bijouterie & Montres', icone: 'watch', description: 'Bijoux et horlogerie de luxe' },
  { id: 'sport', nom: 'Sport & Loisirs', icone: 'fitness_center', description: 'Articles de sport' },
  { id: 'services', nom: 'Services', icone: 'miscellaneous_services', description: 'Banques, agences et autres services' }
];

export const BOUTIQUES: Boutique[] = [
  // Mode & Accessoires
  {
    id: 'elegance-paris',
    nom: 'Élégance Paris',
    type: 'boutique',
    categorie: 'mode',
    description: 'Haute couture et prêt-à-porter de luxe pour femmes',
    descriptionLongue: 'Élégance Paris vous propose une sélection raffinée de pièces haute couture et prêt-à-porter haut de gamme. Nos créations allient savoir-faire artisanal et modernité pour sublimer la femme contemporaine. Découvrez nos collections exclusives signées par les plus grands créateurs.',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
    logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
    etage: 1,
    position: { x: 10, y: 15 },
    horaires: {
      lundi: '10:00 - 20:00',
      mardi: '10:00 - 20:00',
      mercredi: '10:00 - 20:00',
      jeudi: '10:00 - 20:00',
      vendredi: '10:00 - 21:00',
      samedi: '09:00 - 21:00',
      dimanche: '10:00 - 18:00'
    },
    telephone: '+261 34 00 00 01',
    email: 'contact@elegance-paris.mg',
    siteWeb: 'https://elegance-paris.mg',
    note: 4.8,
    avis: 256,
    tags: ['Luxe', 'Femme', 'Haute Couture'],
    nouveau: false,
    produits: [
      { id: 'ep1', nom: 'Robe de Soirée Céleste', description: 'Robe longue en soie avec broderies', prix: 890000, prixPromo: 712000, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', categorie: 'Robes', disponible: true, nouveau: true },
      { id: 'ep2', nom: 'Tailleur Executive', description: 'Ensemble veste et pantalon coupe ajustée', prix: 650000, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', categorie: 'Tailleurs', disponible: true, nouveau: false },
      { id: 'ep3', nom: 'Blouse en Soie Ivoire', description: 'Blouse fluide 100% soie naturelle', prix: 280000, image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400', categorie: 'Hauts', disponible: true, nouveau: false },
      { id: 'ep4', nom: 'Jupe Midi Plissée', description: 'Jupe plissée taille haute', prix: 320000, image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0uj9a?w=400', categorie: 'Jupes', disponible: true, nouveau: true }
    ],
    promotions: []
  },
  {
    id: 'gentleman-store',
    nom: 'Gentleman Store',
    type: 'boutique',
    categorie: 'mode',
    description: 'Mode masculine haut de gamme et costumes sur mesure',
    descriptionLongue: 'Gentleman Store est la référence de l\'élégance masculine à Antananarivo. Notre maison propose des costumes sur mesure, des chemises de créateurs et des accessoires raffinés pour l\'homme moderne qui cultive son style avec exigence.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    logo: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=200',
    etage: 1,
    position: { x: 25, y: 15 },
    horaires: {
      lundi: '10:00 - 20:00',
      mardi: '10:00 - 20:00',
      mercredi: '10:00 - 20:00',
      jeudi: '10:00 - 20:00',
      vendredi: '10:00 - 21:00',
      samedi: '09:00 - 21:00',
      dimanche: '10:00 - 18:00'
    },
    telephone: '+261 34 00 00 02',
    email: 'contact@gentleman-store.mg',
    note: 4.9,
    avis: 189,
    tags: ['Homme', 'Costumes', 'Sur-mesure'],
    nouveau: false,
    produits: [
      { id: 'gs1', nom: 'Costume Trois Pièces Premium', description: 'Costume en laine italienne avec gilet', prix: 1250000, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', categorie: 'Costumes', disponible: true, nouveau: false },
      { id: 'gs2', nom: 'Chemise Oxford Classic', description: 'Chemise 100% coton égyptien', prix: 180000, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', categorie: 'Chemises', disponible: true, nouveau: false },
      { id: 'gs3', nom: 'Cravate en Soie Paisley', description: 'Cravate artisanale motif paisley', prix: 95000, image: 'https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?w=400', categorie: 'Accessoires', disponible: true, nouveau: true },
      { id: 'gs4', nom: 'Mocassins Cuir Pleine Fleur', description: 'Chaussures fabriquées en Italie', prix: 480000, image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400', categorie: 'Chaussures', disponible: true, nouveau: false }
    ],
    promotions: []
  },
  {
    id: 'urban-style',
    nom: 'Urban Style',
    type: 'boutique',
    categorie: 'mode',
    description: 'Streetwear et mode urbaine tendance',
    descriptionLongue: 'Urban Style vous propose les dernières tendances streetwear des marques les plus en vogue. Des sneakers exclusives aux hoodies design, trouvez votre style urbain unique.',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
    logo: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200',
    etage: 2,
    position: { x: 40, y: 30 },
    horaires: {
      lundi: '10:00 - 20:00',
      mardi: '10:00 - 20:00',
      mercredi: '10:00 - 20:00',
      jeudi: '10:00 - 20:00',
      vendredi: '10:00 - 21:00',
      samedi: '09:00 - 21:00',
      dimanche: '10:00 - 18:00'
    },
    telephone: '+261 34 00 00 03',
    email: 'contact@urban-style.mg',
    note: 4.6,
    avis: 342,
    tags: ['Streetwear', 'Sneakers', 'Tendance'],
    nouveau: true,
    produits: [
      { id: 'us1', nom: 'Sneakers Limited Edition', description: 'Baskets en édition limitée', prix: 380000, image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400', categorie: 'Chaussures', disponible: true, nouveau: true },
      { id: 'us2', nom: 'Hoodie Premium', description: 'Sweat à capuche oversize', prix: 145000, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', categorie: 'Hauts', disponible: true, nouveau: false },
      { id: 'us3', nom: 'Jean Cargo Vintage', description: 'Jean cargo coupe décontractée', prix: 165000, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', categorie: 'Pantalons', disponible: true, nouveau: false }
    ],
    promotions: []
  },

  // Beauté & Bien-être
  {
    id: 'beaute-divine',
    nom: 'Beauté Divine',
    type: 'boutique',
    categorie: 'beaute',
    description: 'Institut de beauté et cosmétiques de luxe',
    descriptionLongue: 'Beauté Divine est votre destination privilégiée pour les soins du visage et du corps. Notre équipe d\'esthéticiennes qualifiées vous accueille dans un cadre raffiné pour des moments de détente absolue. Découvrez également notre sélection de cosmétiques premium.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200',
    etage: 1,
    position: { x: 45, y: 15 },
    horaires: {
      lundi: '09:00 - 19:00',
      mardi: '09:00 - 19:00',
      mercredi: '09:00 - 19:00',
      jeudi: '09:00 - 19:00',
      vendredi: '09:00 - 20:00',
      samedi: '09:00 - 20:00',
      dimanche: 'Fermé'
    },
    telephone: '+261 34 00 00 04',
    email: 'rdv@beaute-divine.mg',
    siteWeb: 'https://beaute-divine.mg',
    note: 4.9,
    avis: 412,
    tags: ['Spa', 'Cosmétiques', 'Soins'],
    nouveau: false,
    produits: [
      { id: 'bd1', nom: 'Soin Visage Signature', description: 'Soin complet anti-âge 90 min', prix: 250000, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400', categorie: 'Soins', disponible: true, nouveau: false },
      { id: 'bd2', nom: 'Coffret Beauté Premium', description: 'Ensemble crème, sérum et masque', prix: 520000, prixPromo: 416000, image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400', categorie: 'Coffrets', disponible: true, nouveau: true },
      { id: 'bd3', nom: 'Huile Précieuse Argan', description: 'Huile pure d\'argan bio 50ml', prix: 85000, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400', categorie: 'Huiles', disponible: true, nouveau: false }
    ],
    promotions: []
  },
  {
    id: 'parfums-orient',
    nom: 'Parfums d\'Orient',
    type: 'boutique',
    categorie: 'beaute',
    description: 'Parfumerie de niche et fragrances exclusives',
    descriptionLongue: 'Parfums d\'Orient vous invite à un voyage olfactif unique. Notre collection réunit les plus belles créations des maisons de parfumerie de niche. Laissez-vous guider par nos conseillers experts pour trouver la fragrance qui vous correspond.',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
    logo: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=200',
    etage: 1,
    position: { x: 60, y: 20 },
    horaires: {
      lundi: '10:00 - 20:00',
      mardi: '10:00 - 20:00',
      mercredi: '10:00 - 20:00',
      jeudi: '10:00 - 20:00',
      vendredi: '10:00 - 21:00',
      samedi: '09:00 - 21:00',
      dimanche: '10:00 - 18:00'
    },
    telephone: '+261 34 00 00 05',
    email: 'contact@parfums-orient.mg',
    note: 4.7,
    avis: 178,
    tags: ['Parfums', 'Niche', 'Luxe'],
    nouveau: false,
    produits: [
      { id: 'po1', nom: 'Oud Royal Collection', description: 'Eau de parfum oud premium 100ml', prix: 680000, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400', categorie: 'Eaux de parfum', disponible: true, nouveau: true },
      { id: 'po2', nom: 'Rose de Damas', description: 'Fragrance florale délicate 75ml', prix: 450000, image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400', categorie: 'Eaux de parfum', disponible: true, nouveau: false },
      { id: 'po3', nom: 'Coffret Découverte', description: '5 miniatures fragrances exclusives', prix: 195000, image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400', categorie: 'Coffrets', disponible: true, nouveau: false }
    ],
    promotions: []
  },

  // Bijouterie & Montres
  {
    id: 'or-diamant',
    nom: 'Or & Diamant',
    type: 'boutique',
    categorie: 'bijouterie',
    description: 'Joaillerie de prestige et haute horlogerie',
    descriptionLongue: 'Or & Diamant perpétue l\'art de la joaillerie depuis 1985. Notre maison sélectionne les plus belles pierres précieuses et propose des créations uniques réalisées par nos maîtres joailliers. Découvrez également notre collection de montres de luxe.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
    logo: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=200',
    etage: 1,
    position: { x: 30, y: 40 },
    horaires: {
      lundi: '10:00 - 19:00',
      mardi: '10:00 - 19:00',
      mercredi: '10:00 - 19:00',
      jeudi: '10:00 - 19:00',
      vendredi: '10:00 - 20:00',
      samedi: '09:00 - 20:00',
      dimanche: 'Fermé'
    },
    telephone: '+261 34 00 00 06',
    email: 'contact@or-diamant.mg',
    siteWeb: 'https://or-diamant.mg',
    note: 5.0,
    avis: 89,
    tags: ['Joaillerie', 'Montres', 'Diamants'],
    nouveau: false,
    produits: [
      { id: 'od1', nom: 'Bague Solitaire Éclat', description: 'Diamant 1 carat, or blanc 18k', prix: 8500000, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', categorie: 'Bagues', disponible: true, nouveau: false },
      { id: 'od2', nom: 'Collier Rivière de Diamants', description: 'Collier tennis 42 diamants', prix: 12000000, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', categorie: 'Colliers', disponible: true, nouveau: true },
      { id: 'od3', nom: 'Montre Classique Or Rose', description: 'Montre automatique suisse', prix: 4800000, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', categorie: 'Montres', disponible: true, nouveau: false }
    ],
    promotions: []
  },

  // Électronique
  {
    id: 'tech-premium',
    nom: 'Tech Premium',
    type: 'boutique',
    categorie: 'electronique',
    description: 'High-tech et gadgets dernière génération',
    descriptionLongue: 'Tech Premium est votre destination pour les dernières innovations technologiques. Smartphones, ordinateurs, audio haut de gamme et accessoires connectés : découvrez le meilleur de la technologie avec les conseils de nos experts.',
    image: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800',
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200',
    etage: 2,
    position: { x: 15, y: 45 },
    horaires: {
      lundi: '10:00 - 20:00',
      mardi: '10:00 - 20:00',
      mercredi: '10:00 - 20:00',
      jeudi: '10:00 - 20:00',
      vendredi: '10:00 - 21:00',
      samedi: '09:00 - 21:00',
      dimanche: '10:00 - 18:00'
    },
    telephone: '+261 34 00 00 07',
    email: 'contact@tech-premium.mg',
    siteWeb: 'https://tech-premium.mg',
    note: 4.6,
    avis: 523,
    tags: ['High-tech', 'Smartphones', 'Audio'],
    nouveau: false,
    produits: [
      { id: 'tp1', nom: 'Smartphone Pro Max', description: 'Dernier flagship 256GB', prix: 4200000, image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400', categorie: 'Smartphones', disponible: true, nouveau: true },
      { id: 'tp2', nom: 'Laptop Ultrabook Premium', description: 'Intel i9, 32GB RAM, SSD 1TB', prix: 6500000, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', categorie: 'Ordinateurs', disponible: true, nouveau: false },
      { id: 'tp3', nom: 'Casque Audio Sans Fil Pro', description: 'Réduction de bruit active', prix: 890000, prixPromo: 712000, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', categorie: 'Audio', disponible: true, nouveau: false },
      { id: 'tp4', nom: 'Montre Connectée Sport', description: 'GPS, cardiofréquencemètre', prix: 650000, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400', categorie: 'Wearables', disponible: true, nouveau: true }
    ],
    promotions: []
  },

  // Maison & Décoration
  {
    id: 'art-interieur',
    nom: 'Art & Intérieur',
    type: 'boutique',
    categorie: 'maison',
    description: 'Mobilier design et décoration d\'exception',
    descriptionLongue: 'Art & Intérieur sublime vos espaces de vie avec une sélection pointue de mobilier design et d\'objets de décoration. Nos conseillers vous accompagnent dans vos projets d\'aménagement pour créer des intérieurs uniques et élégants.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800',
    logo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200',
    etage: 2,
    position: { x: 55, y: 50 },
    horaires: {
      lundi: '10:00 - 19:00',
      mardi: '10:00 - 19:00',
      mercredi: '10:00 - 19:00',
      jeudi: '10:00 - 19:00',
      vendredi: '10:00 - 20:00',
      samedi: '09:00 - 20:00',
      dimanche: '10:00 - 17:00'
    },
    telephone: '+261 34 00 00 08',
    email: 'contact@art-interieur.mg',
    note: 4.8,
    avis: 156,
    tags: ['Mobilier', 'Décoration', 'Design'],
    nouveau: false,
    produits: [
      { id: 'ai1', nom: 'Canapé Design Scandinave', description: 'Canapé 3 places tissu premium', prix: 3200000, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', categorie: 'Canapés', disponible: true, nouveau: false },
      { id: 'ai2', nom: 'Lampe Architecte', description: 'Lampadaire articulé laiton', prix: 480000, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', categorie: 'Luminaires', disponible: true, nouveau: true },
      { id: 'ai3', nom: 'Table Basse Marbre', description: 'Plateau marbre blanc, pieds dorés', prix: 1850000, image: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=400', categorie: 'Tables', disponible: true, nouveau: false }
    ],
    promotions: []
  },

  // Restaurants
  {
    id: 'la-terrasse',
    nom: 'La Terrasse',
    type: 'restaurant',
    categorie: 'restauration',
    description: 'Cuisine française gastronomique avec vue panoramique',
    descriptionLongue: 'La Terrasse vous invite à une expérience culinaire d\'exception. Notre chef étoilé revisite les classiques de la cuisine française avec des produits locaux de première qualité. Savourez nos plats dans un cadre élégant avec une vue imprenable sur Antananarivo.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    logo: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200',
    etage: 2,
    position: { x: 70, y: 20 },
    horaires: {
      lundi: '12:00 - 14:30, 19:00 - 22:30',
      mardi: '12:00 - 14:30, 19:00 - 22:30',
      mercredi: '12:00 - 14:30, 19:00 - 22:30',
      jeudi: '12:00 - 14:30, 19:00 - 22:30',
      vendredi: '12:00 - 14:30, 19:00 - 23:00',
      samedi: '12:00 - 15:00, 19:00 - 23:00',
      dimanche: '12:00 - 15:00'
    },
    telephone: '+261 34 00 00 09',
    email: 'reservation@la-terrasse.mg',
    siteWeb: 'https://la-terrasse.mg',
    note: 4.9,
    avis: 287,
    tags: ['Gastronomique', 'Français', 'Vue panoramique'],
    nouveau: false,
    produits: [
      { id: 'lt1', nom: 'Menu Dégustation', description: '7 plats avec accords mets-vins', prix: 280000, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', categorie: 'Menus', disponible: true, nouveau: false },
      { id: 'lt2', nom: 'Filet de Zébu Wellington', description: 'Filet en croûte, sauce truffe', prix: 125000, image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400', categorie: 'Plats', disponible: true, nouveau: true },
      { id: 'lt3', nom: 'Crème Brûlée à la Vanille', description: 'Vanille de Madagascar', prix: 35000, image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400', categorie: 'Desserts', disponible: true, nouveau: false }
    ],
    promotions: []
  },
  {
    id: 'sakura-sushi',
    nom: 'Sakura Sushi',
    type: 'restaurant',
    categorie: 'restauration',
    description: 'Cuisine japonaise authentique et sushis premium',
    descriptionLongue: 'Sakura Sushi vous transporte au cœur du Japon avec une cuisine authentique préparée par notre chef japonais. Sushis, sashimis et spécialités sont élaborés avec des poissons frais sélectionnés quotidiennement.',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    logo: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=200',
    etage: 2,
    position: { x: 80, y: 35 },
    horaires: {
      lundi: '11:30 - 14:30, 18:30 - 22:00',
      mardi: '11:30 - 14:30, 18:30 - 22:00',
      mercredi: '11:30 - 14:30, 18:30 - 22:00',
      jeudi: '11:30 - 14:30, 18:30 - 22:00',
      vendredi: '11:30 - 14:30, 18:30 - 23:00',
      samedi: '11:30 - 23:00',
      dimanche: '11:30 - 21:00'
    },
    telephone: '+261 34 00 00 10',
    email: 'contact@sakura-sushi.mg',
    note: 4.7,
    avis: 198,
    tags: ['Japonais', 'Sushi', 'Authentique'],
    nouveau: false,
    produits: [
      { id: 'ss1', nom: 'Plateau Sakura Premium', description: '24 pièces variées chef', prix: 145000, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400', categorie: 'Plateaux', disponible: true, nouveau: false },
      { id: 'ss2', nom: 'Ramen Tonkotsu', description: 'Bouillon 12h, porc braisé', prix: 48000, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', categorie: 'Nouilles', disponible: true, nouveau: true },
      { id: 'ss3', nom: 'Tempura Mixte', description: 'Crevettes et légumes frits', prix: 38000, image: 'https://images.unsplash.com/photo-1615361200098-9e630ec29b4e?w=400', categorie: 'Entrées', disponible: true, nouveau: false }
    ],
    promotions: []
  },
  {
    id: 'cafe-imperial',
    nom: 'Café Impérial',
    type: 'restaurant',
    categorie: 'restauration',
    description: 'Salon de thé et pâtisserie fine',
    descriptionLongue: 'Le Café Impérial est un écrin de douceur où se mêlent l\'art de la pâtisserie française et les saveurs malgaches. Nos créations sucrées accompagnent parfaitement nos cafés de plantation et thés d\'exception.',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    logo: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=200',
    etage: 1,
    position: { x: 50, y: 55 },
    horaires: {
      lundi: '08:00 - 20:00',
      mardi: '08:00 - 20:00',
      mercredi: '08:00 - 20:00',
      jeudi: '08:00 - 20:00',
      vendredi: '08:00 - 21:00',
      samedi: '08:00 - 21:00',
      dimanche: '09:00 - 18:00'
    },
    telephone: '+261 34 00 00 11',
    email: 'contact@cafe-imperial.mg',
    note: 4.8,
    avis: 456,
    tags: ['Café', 'Pâtisserie', 'Brunch'],
    nouveau: false,
    produits: [
      { id: 'ci1', nom: 'Formule Brunch Impérial', description: 'Viennoiseries, œufs, fruits frais', prix: 65000, image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400', categorie: 'Brunch', disponible: true, nouveau: false },
      { id: 'ci2', nom: 'Paris-Brest Signature', description: 'Praliné maison, noisettes', prix: 28000, image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400', categorie: 'Pâtisseries', disponible: true, nouveau: true },
      { id: 'ci3', nom: 'Café de Plantation Bio', description: 'Arabica malgache torréfié', prix: 12000, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', categorie: 'Boissons', disponible: true, nouveau: false }
    ],
    promotions: []
  },

  // Sport & Loisirs
  {
    id: 'sport-elite',
    nom: 'Sport Élite',
    type: 'boutique',
    categorie: 'sport',
    description: 'Équipements sportifs et vêtements techniques',
    descriptionLongue: 'Sport Élite équipe les sportifs exigeants avec les meilleures marques mondiales. Running, fitness, natation, football : trouvez l\'équipement adapté à votre pratique avec les conseils de nos spécialistes.',
    image: 'https://images.unsplash.com/photo-1461896836934- voices5a89dd?w=800',
    logo: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=200',
    etage: 2,
    position: { x: 25, y: 60 },
    horaires: {
      lundi: '10:00 - 20:00',
      mardi: '10:00 - 20:00',
      mercredi: '10:00 - 20:00',
      jeudi: '10:00 - 20:00',
      vendredi: '10:00 - 21:00',
      samedi: '09:00 - 21:00',
      dimanche: '10:00 - 18:00'
    },
    telephone: '+261 34 00 00 12',
    email: 'contact@sport-elite.mg',
    note: 4.5,
    avis: 234,
    tags: ['Sport', 'Running', 'Fitness'],
    nouveau: true,
    produits: [
      { id: 'se1', nom: 'Chaussures Running Pro', description: 'Amorti premium, légèreté', prix: 320000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', categorie: 'Chaussures', disponible: true, nouveau: true },
      { id: 'se2', nom: 'Ensemble Training Premium', description: 'Veste + pantalon respirants', prix: 185000, image: 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=400', categorie: 'Vêtements', disponible: true, nouveau: false },
      { id: 'se3', nom: 'Sac de Sport Voyage', description: 'Grande capacité 60L', prix: 95000, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', categorie: 'Accessoires', disponible: true, nouveau: false }
    ],
    promotions: []
  },

  // Services
  {
    id: 'banque-premiere',
    nom: 'Banque Première',
    type: 'service',
    categorie: 'services',
    description: 'Agence bancaire et services financiers premium',
    descriptionLongue: 'Banque Première met à votre disposition une équipe de conseillers dédiés pour une gestion personnalisée de votre patrimoine. Services bancaires, investissements, assurances : bénéficiez d\'un accompagnement sur-mesure.',
    image: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=800',
    logo: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=200',
    etage: 1,
    position: { x: 75, y: 50 },
    horaires: {
      lundi: '08:30 - 16:00',
      mardi: '08:30 - 16:00',
      mercredi: '08:30 - 16:00',
      jeudi: '08:30 - 16:00',
      vendredi: '08:30 - 15:00',
      samedi: '09:00 - 12:00',
      dimanche: 'Fermé'
    },
    telephone: '+261 34 00 00 13',
    email: 'contact@banque-premiere.mg',
    siteWeb: 'https://banque-premiere.mg',
    note: 4.4,
    avis: 89,
    tags: ['Banque', 'Finance', 'Patrimoine'],
    nouveau: false,
    produits: [],
    promotions: []
  }
];

// Générer les promotions à partir des boutiques
export const PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    titre: 'Soldes d\'Été - Mode Femme',
    description: 'Profitez de -20% sur toute la collection printemps-été',
    reduction: 20,
    type: 'pourcentage',
    dateDebut: new Date('2026-01-15'),
    dateFin: new Date('2026-02-28'),
    image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800',
    conditions: 'Valable sur les articles signalés. Non cumulable avec d\'autres offres.',
    boutiqueId: 'elegance-paris',
    boutiqueNom: 'Élégance Paris',
    boutiqueLogo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200'
  },
  {
    id: 'promo-2',
    titre: 'Coffret Beauté Offert',
    description: 'Un coffret miniatures offert pour 200 000 Ar d\'achat',
    reduction: 0,
    type: 'offre',
    dateDebut: new Date('2026-02-01'),
    dateFin: new Date('2026-02-14'),
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    conditions: 'Dans la limite des stocks disponibles.',
    boutiqueId: 'beaute-divine',
    boutiqueNom: 'Beauté Divine',
    boutiqueLogo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200'
  },
  {
    id: 'promo-3',
    titre: 'Happy Hour Tech',
    description: '-15% sur tous les accessoires high-tech',
    reduction: 15,
    type: 'pourcentage',
    dateDebut: new Date('2026-02-01'),
    dateFin: new Date('2026-02-15'),
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    conditions: 'Valable de 14h à 18h uniquement.',
    code: 'TECH15',
    boutiqueId: 'tech-premium',
    boutiqueNom: 'Tech Premium',
    boutiqueLogo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200'
  },
  {
    id: 'promo-4',
    titre: 'Menu Saint-Valentin',
    description: 'Dîner romantique pour 2 avec champagne offert',
    reduction: 0,
    type: 'offre',
    dateDebut: new Date('2026-02-10'),
    dateFin: new Date('2026-02-14'),
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    conditions: 'Sur réservation uniquement. Menu à 350 000 Ar pour 2.',
    boutiqueId: 'la-terrasse',
    boutiqueNom: 'La Terrasse',
    boutiqueLogo: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200'
  },
  {
    id: 'promo-5',
    titre: 'Sneakers Limited -30%',
    description: 'Collection exclusive en édition limitée',
    reduction: 30,
    type: 'pourcentage',
    dateDebut: new Date('2026-02-01'),
    dateFin: new Date('2026-02-20'),
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800',
    conditions: 'Jusqu\'à épuisement des stocks.',
    boutiqueId: 'urban-style',
    boutiqueNom: 'Urban Style',
    boutiqueLogo: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200'
  },
  {
    id: 'promo-6',
    titre: 'Brunch Dominical',
    description: 'Formule brunch illimitée à prix fixe',
    reduction: 0,
    type: 'offre',
    dateDebut: new Date('2026-01-01'),
    dateFin: new Date('2026-03-31'),
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800',
    conditions: 'Chaque dimanche de 10h à 14h. 85 000 Ar par personne.',
    boutiqueId: 'cafe-imperial',
    boutiqueNom: 'Café Impérial',
    boutiqueLogo: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=200'
  },
  {
    id: 'promo-7',
    titre: 'Nouvelle Collection Costumes',
    description: '-50 000 Ar sur le deuxième costume acheté',
    reduction: 50000,
    type: 'montant',
    dateDebut: new Date('2026-02-01'),
    dateFin: new Date('2026-02-28'),
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    conditions: 'Pour l\'achat de 2 costumes ou plus.',
    boutiqueId: 'gentleman-store',
    boutiqueNom: 'Gentleman Store',
    boutiqueLogo: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=200'
  },
  {
    id: 'promo-8',
    titre: 'Offre Parfum Duo',
    description: 'Achetez 1 parfum, le 2ème à -50%',
    reduction: 50,
    type: 'pourcentage',
    dateDebut: new Date('2026-02-05'),
    dateFin: new Date('2026-02-28'),
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
    conditions: 'Sur le parfum de valeur inférieure ou égale.',
    boutiqueId: 'parfums-orient',
    boutiqueNom: 'Parfums d\'Orient',
    boutiqueLogo: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=200'
  }
];

// Slider images pour la page d'accueil
export const SLIDER_IMAGES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1600',
    titre: 'Bienvenue à Tana Center',
    sousTitre: 'L\'expérience shopping premium au cœur d\'Antananarivo',
    bouton: 'Découvrir nos boutiques'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1600',
    titre: 'Nouvelle Collection Printemps',
    sousTitre: 'Découvrez les dernières tendances mode',
    bouton: 'Voir les nouveautés'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600',
    titre: 'Gastronomie d\'Exception',
    sousTitre: 'Nos restaurants vous attendent',
    bouton: 'Réserver une table'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600',
    titre: 'Soldes d\'Hiver',
    sousTitre: 'Jusqu\'à -50% dans vos boutiques préférées',
    bouton: 'Voir les promotions'
  }
];
