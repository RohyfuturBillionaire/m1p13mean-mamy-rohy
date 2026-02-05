import { User, Contrat, Paiement, Facture, DemandePromotion, Conversation, Message, Notification, ParametresSite } from '../models/admin.model';

// Users Mock Data
export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    nom: 'Rakoto',
    prenom: 'Jean',
    email: 'jean.rakoto@email.com',
    telephone: '+261 34 12 345 67',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    dateInscription: new Date('2023-01-15'),
    actif: true
  },
  {
    id: 'user-2',
    nom: 'Rasoa',
    prenom: 'Marie',
    email: 'marie.rasoa@elegance.com',
    telephone: '+261 33 98 765 43',
    role: 'boutique',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    dateInscription: new Date('2023-03-20'),
    actif: true
  },
  {
    id: 'user-3',
    nom: 'Andria',
    prenom: 'Paul',
    email: 'paul.andria@gmail.com',
    telephone: '+261 32 11 222 33',
    role: 'client',
    dateInscription: new Date('2023-06-10'),
    actif: true
  },
  {
    id: 'user-4',
    nom: 'Rabe',
    prenom: 'Sophie',
    email: 'sophie.rabe@beaute.com',
    telephone: '+261 34 55 666 77',
    role: 'boutique',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    dateInscription: new Date('2023-04-05'),
    actif: true
  },
  {
    id: 'user-5',
    nom: 'Randria',
    prenom: 'Lucas',
    email: 'lucas.randria@email.com',
    telephone: '+261 33 44 555 66',
    role: 'client',
    dateInscription: new Date('2023-08-15'),
    actif: false
  },
  {
    id: 'user-6',
    nom: 'Raharison',
    prenom: 'Emma',
    email: 'emma.raharison@cafe.com',
    telephone: '+261 32 77 888 99',
    role: 'boutique',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    dateInscription: new Date('2023-05-22'),
    actif: true
  },
  {
    id: 'user-7',
    nom: 'Razafy',
    prenom: 'Thomas',
    email: 'thomas.razafy@gmail.com',
    telephone: '+261 34 00 111 22',
    role: 'client',
    dateInscription: new Date('2023-09-01'),
    actif: true
  },
  {
    id: 'user-8',
    nom: 'Rabemanana',
    prenom: 'Claire',
    email: 'claire.rabemanana@tech.com',
    telephone: '+261 33 22 333 44',
    role: 'boutique',
    dateInscription: new Date('2023-07-12'),
    actif: true
  }
];

// Contrats Mock Data
export const MOCK_CONTRATS: Contrat[] = [
  {
    id: 'contrat-1',
    boutiqueId: 'elegance-paris',
    clientId: 'user-2',
    nomClient: 'Marie Rasoa',
    nomEntreprise: 'Élégance Paris SARL',
    dateDebut: new Date('2023-01-01'),
    dateFin: new Date('2025-12-31'),
    loyerMensuel: 5000000,
    surface: 120,
    etage: 1,
    numero: 'A-101',
    statut: 'actif'
  },
  {
    id: 'contrat-2',
    boutiqueId: 'beaute-divine',
    clientId: 'user-4',
    nomClient: 'Sophie Rabe',
    nomEntreprise: 'Beauté Divine SA',
    dateDebut: new Date('2023-03-01'),
    dateFin: new Date('2025-02-28'),
    loyerMensuel: 3500000,
    surface: 80,
    etage: 1,
    numero: 'A-104',
    statut: 'actif'
  },
  {
    id: 'contrat-3',
    boutiqueId: 'cafe-imperial',
    clientId: 'user-6',
    nomClient: 'Emma Raharison',
    nomEntreprise: 'Café Impérial SARL',
    dateDebut: new Date('2023-05-01'),
    dateFin: new Date('2024-04-30'),
    loyerMensuel: 4000000,
    surface: 100,
    etage: 1,
    numero: 'B-202',
    statut: 'actif'
  },
  {
    id: 'contrat-4',
    boutiqueId: 'tech-premium',
    clientId: 'user-8',
    nomClient: 'Claire Rabemanana',
    nomEntreprise: 'Tech Premium SA',
    dateDebut: new Date('2023-07-01'),
    dateFin: new Date('2024-06-30'),
    loyerMensuel: 6000000,
    surface: 150,
    etage: 1,
    numero: 'C-301',
    statut: 'actif'
  }
];

// Paiements Mock Data
export const MOCK_PAIEMENTS: Paiement[] = [
  {
    id: 'paie-1',
    contratId: 'contrat-1',
    boutiqueNom: 'Élégance Paris',
    montant: 5000000,
    datePaiement: new Date('2024-01-05'),
    dateEcheance: new Date('2024-01-01'),
    statut: 'paye',
    mois: 'Janvier',
    annee: 2024
  },
  {
    id: 'paie-2',
    contratId: 'contrat-1',
    boutiqueNom: 'Élégance Paris',
    montant: 5000000,
    datePaiement: new Date('2024-02-03'),
    dateEcheance: new Date('2024-02-01'),
    statut: 'paye',
    mois: 'Février',
    annee: 2024
  },
  {
    id: 'paie-3',
    contratId: 'contrat-2',
    boutiqueNom: 'Beauté Divine',
    montant: 3500000,
    datePaiement: new Date(),
    dateEcheance: new Date('2024-02-01'),
    statut: 'en_retard',
    mois: 'Février',
    annee: 2024
  },
  {
    id: 'paie-4',
    contratId: 'contrat-3',
    boutiqueNom: 'Café Impérial',
    montant: 4000000,
    datePaiement: new Date(),
    dateEcheance: new Date('2024-02-01'),
    statut: 'en_attente',
    mois: 'Février',
    annee: 2024
  },
  {
    id: 'paie-5',
    contratId: 'contrat-4',
    boutiqueNom: 'Tech Premium',
    montant: 6000000,
    datePaiement: new Date('2024-02-01'),
    dateEcheance: new Date('2024-02-01'),
    statut: 'paye',
    mois: 'Février',
    annee: 2024
  }
];

// Factures Mock Data
export const MOCK_FACTURES: Facture[] = [
  {
    id: 'fact-1',
    numero: 'FACT-2024-001',
    contratId: 'contrat-1',
    boutiqueNom: 'Élégance Paris',
    clientNom: 'Marie Rasoa',
    montant: 5000000,
    tva: 1000000,
    total: 6000000,
    dateEmission: new Date('2024-01-01'),
    dateEcheance: new Date('2024-01-15'),
    statut: 'payee'
  },
  {
    id: 'fact-2',
    numero: 'FACT-2024-002',
    contratId: 'contrat-2',
    boutiqueNom: 'Beauté Divine',
    clientNom: 'Sophie Rabe',
    montant: 3500000,
    tva: 700000,
    total: 4200000,
    dateEmission: new Date('2024-02-01'),
    dateEcheance: new Date('2024-02-15'),
    statut: 'en_retard'
  },
  {
    id: 'fact-3',
    numero: 'FACT-2024-003',
    contratId: 'contrat-3',
    boutiqueNom: 'Café Impérial',
    clientNom: 'Emma Raharison',
    montant: 4000000,
    tva: 800000,
    total: 4800000,
    dateEmission: new Date('2024-02-01'),
    dateEcheance: new Date('2024-02-15'),
    statut: 'en_attente'
  }
];

// Demandes de Promotion Mock Data
export const MOCK_DEMANDES_PROMOTION: DemandePromotion[] = [
  {
    id: 'promo-req-1',
    boutiqueId: 'elegance-paris',
    boutiqueNom: 'Élégance Paris',
    titre: 'Soldes d\'Hiver -50%',
    description: 'Grande vente d\'hiver sur toute la collection automne-hiver',
    reduction: 50,
    dateDebut: new Date('2024-02-15'),
    dateFin: new Date('2024-03-15'),
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
    statut: 'en_attente',
    dateDemande: new Date('2024-02-01'),
    montantPub: 500000
  },
  {
    id: 'promo-req-2',
    boutiqueId: 'beaute-divine',
    boutiqueNom: 'Beauté Divine',
    titre: 'Saint-Valentin -30%',
    description: 'Offre spéciale Saint-Valentin sur les parfums et cosmétiques',
    reduction: 30,
    dateDebut: new Date('2024-02-10'),
    dateFin: new Date('2024-02-14'),
    statut: 'validee',
    dateDemande: new Date('2024-01-25'),
    montantPub: 300000
  },
  {
    id: 'promo-req-3',
    boutiqueId: 'tech-premium',
    boutiqueNom: 'Tech Premium',
    titre: 'Nouveaux iPhone 15',
    description: 'Lancement du nouvel iPhone avec accessoires offerts',
    reduction: 10,
    dateDebut: new Date('2024-03-01'),
    dateFin: new Date('2024-03-31'),
    statut: 'refusee',
    dateDemande: new Date('2024-02-10'),
    montantPub: 800000
  }
];

// Conversations Mock Data
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participants: [
      { id: 'user-1', nom: 'Admin', role: 'admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
      { id: 'user-2', nom: 'Marie Rasoa', role: 'boutique', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }
    ],
    dernierMessage: 'Merci pour la confirmation du renouvellement.',
    dateModification: new Date('2024-02-01T14:30:00'),
    nonLus: 2
  },
  {
    id: 'conv-2',
    participants: [
      { id: 'user-1', nom: 'Admin', role: 'admin' },
      { id: 'user-4', nom: 'Sophie Rabe', role: 'boutique', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' }
    ],
    dernierMessage: 'Rappel concernant le paiement du loyer.',
    dateModification: new Date('2024-02-02T09:15:00'),
    nonLus: 0
  },
  {
    id: 'conv-3',
    participants: [
      { id: 'user-1', nom: 'Admin', role: 'admin' },
      { id: 'user-3', nom: 'Paul Andria', role: 'client' }
    ],
    dernierMessage: 'Question concernant les horaires d\'ouverture.',
    dateModification: new Date('2024-02-01T16:45:00'),
    nonLus: 1
  }
];

// Messages Mock Data
export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    expediteurId: 'user-2',
    expediteurNom: 'Marie Rasoa',
    expediteurRole: 'boutique',
    destinataireId: 'user-1',
    destinataireNom: 'Admin',
    contenu: 'Bonjour, je souhaite renouveler mon contrat pour 2 ans supplémentaires.',
    dateEnvoi: new Date('2024-02-01T10:00:00'),
    lu: true
  },
  {
    id: 'msg-2',
    expediteurId: 'user-1',
    expediteurNom: 'Admin',
    expediteurRole: 'admin',
    destinataireId: 'user-2',
    destinataireNom: 'Marie Rasoa',
    contenu: 'Bonjour Madame Rasoa, nous avons bien reçu votre demande. Le nouveau contrat sera prêt dans 48h.',
    dateEnvoi: new Date('2024-02-01T11:30:00'),
    lu: true
  },
  {
    id: 'msg-3',
    expediteurId: 'user-2',
    expediteurNom: 'Marie Rasoa',
    expediteurRole: 'boutique',
    destinataireId: 'user-1',
    destinataireNom: 'Admin',
    contenu: 'Merci pour la confirmation du renouvellement.',
    dateEnvoi: new Date('2024-02-01T14:30:00'),
    lu: false
  }
];

// Notifications Mock Data
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'paiement',
    titre: 'Paiement reçu',
    message: 'Élégance Paris a effectué le paiement du loyer de février.',
    date: new Date('2024-02-03T09:00:00'),
    lu: false,
    lien: '/admin/loyers'
  },
  {
    id: 'notif-2',
    type: 'demande',
    titre: 'Nouvelle demande de promotion',
    message: 'Élégance Paris souhaite publier une promotion "Soldes d\'Hiver".',
    date: new Date('2024-02-01T14:00:00'),
    lu: false,
    lien: '/admin/promotions'
  },
  {
    id: 'notif-3',
    type: 'alerte',
    titre: 'Retard de paiement',
    message: 'Beauté Divine a un retard de paiement de 5 jours.',
    date: new Date('2024-02-06T08:00:00'),
    lu: true,
    lien: '/admin/loyers'
  },
  {
    id: 'notif-4',
    type: 'alerte',
    titre: 'Contrat expirant',
    message: 'Le contrat de Café Impérial expire dans 60 jours.',
    date: new Date('2024-02-01T10:00:00'),
    lu: true,
    lien: '/admin/boutiques'
  },
  {
    id: 'notif-5',
    type: 'info',
    titre: 'Nouveau client inscrit',
    message: 'Thomas Razafy vient de créer un compte client.',
    date: new Date('2024-01-28T16:30:00'),
    lu: true
  }
];

// Paramètres du site par défaut
export const DEFAULT_PARAMETRES: ParametresSite = {
  nomCentre: 'Tana Center',
  slogan: 'Votre destination shopping de luxe à Antananarivo',
  couleurPrimaire: '#C9A962',
  couleurSecondaire: '#1a1a1a',
  email: 'contact@tanacenter.mg',
  telephone: '+261 20 22 123 45',
  adresse: 'Avenue de l\'Indépendance, Antananarivo 101, Madagascar',
  horaires: {
    semaine: '09:00 - 21:00',
    weekend: '10:00 - 22:00'
  },
  sectionsActives: {
    promotions: true,
    map: true,
    boutiques: true,
    evenements: true
  },
  modeMaintenace: false,
  inscriptionOuverte: true
};

// Données pour les graphiques
export const REVENUS_MENSUELS = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
  data: [18500000, 19200000, 17800000, 20100000, 21500000, 19800000, 22300000, 23100000, 20800000, 21900000, 24500000, 26000000]
};

export const LOYERS_PAR_BOUTIQUE = {
  labels: ['Élégance Paris', 'Beauté Divine', 'Café Impérial', 'Tech Premium', 'Or & Diamant', 'Gentleman Store'],
  data: [5000000, 3500000, 4000000, 6000000, 4500000, 3800000]
};

export const STATS_PROMOTIONS = {
  labels: ['En attente', 'Validées', 'Refusées', 'Expirées'],
  data: [5, 12, 3, 8]
};

export const VISITEURS_MENSUELS = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
  data: [45000, 52000, 48000, 61000, 55000, 67000]
};

// Templates d'emails
export const EMAIL_TEMPLATES = {
  retardPaiement: {
    sujet: 'Rappel - Paiement de loyer en retard',
    corps: `Cher(e) {{nom}},

Nous vous informons que le paiement de votre loyer pour le mois de {{mois}} n'a pas encore été reçu.

Montant dû : {{montant}} Ar
Date d'échéance : {{dateEcheance}}
Jours de retard : {{joursRetard}}

Nous vous prions de bien vouloir régulariser cette situation dans les plus brefs délais.

Cordialement,
L'équipe Tana Center`
  },
  promotionValidee: {
    sujet: 'Votre promotion a été validée',
    corps: `Cher(e) {{nom}},

Nous avons le plaisir de vous informer que votre demande de promotion "{{titrePromo}}" a été validée.

Détails de la promotion :
- Réduction : {{reduction}}%
- Date de début : {{dateDebut}}
- Date de fin : {{dateFin}}

Votre promotion sera visible sur notre site et dans le centre commercial.

Cordialement,
L'équipe Tana Center`
  },
  notificationGenerale: {
    sujet: 'Information importante - Tana Center',
    corps: `Cher(e) {{nom}},

{{message}}

Pour toute question, n'hésitez pas à nous contacter.

Cordialement,
L'équipe Tana Center`
  }
};
