const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tana Center API',
      version: '1.0.0',
      description: 'Documentation de toutes les routes API du backend Tana Center',
    },
    servers: [
      { url: process.env.URL || 'http://localhost:5000', description: 'Url de l\'API' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token JWT (15 min). Obtenez-le via POST /auth/login.',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentification & tokens' },
      { name: 'Users', description: 'Gestion des utilisateurs' },
      { name: 'Boutiques', description: 'Gestion des boutiques' },
      { name: 'Articles', description: 'Articles & catégories articles' },
      { name: 'Stocks', description: 'Mouvements de stock' },
      { name: 'Commandes', description: 'Commandes clients' },
      { name: 'Payments', description: 'Paiements de loyer' },
      { name: 'Contracts', description: 'Contrats commerciaux' },
      { name: 'ContractTypes', description: 'Types de contrats' },
      { name: 'Categories', description: 'Catégories boutiques' },
      { name: 'Promotions', description: 'Promotions' },
      { name: 'Bucket', description: 'Panier client' },
      { name: 'Favorites', description: 'Favoris client' },
      { name: 'Avis', description: 'Avis / notes boutiques' },
      { name: 'Notifications', description: 'Notifications' },
      { name: 'Locaux', description: 'Locaux commerciaux' },
      { name: 'Roles', description: 'Rôles utilisateurs' },
      { name: 'Horaires', description: "Horaires d'ouverture boutique" },
      { name: 'FAQs', description: 'FAQ & catégories FAQ' },
      { name: 'Conversations', description: 'Messagerie — conversations' },
      { name: 'Messages', description: 'Messagerie — messages' },
      { name: 'SiteCRM', description: 'Paramètres CRM du site' },
      { name: 'SiteContenu', description: 'Contenu du site' },
      { name: 'ImgSlider', description: 'Images du slider homepage' },
      { name: 'Admin', description: 'Dashboard admin' },
      { name: 'Bucket Storage', description: 'Gestion fichiers Vercel Blob' },
    ],
    paths: {

      // ─────────────────────────────────────────────────────────────
      // AUTH
      // ─────────────────────────────────────────────────────────────
      '/auth/signup': {
        post: {
          tags: ['Auth'],
          summary: "Inscription d'un nouvel utilisateur",
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'email', 'password', 'id_role'],
                  properties: {
                    username: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                    id_role: { type: 'string', description: 'ObjectId du rôle' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Compte créé + auto-login (accessToken + cookie refreshToken)' },
            400: { description: 'Email déjà utilisé' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Connexion',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'accessToken + infos utilisateur (cookie refreshToken posé)' },
            401: { description: 'Identifiants invalides' },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Déconnexion (révoque le refresh token)',
          responses: {
            200: { description: 'Déconnecté' },
          },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Renouveler l\'access token via le cookie refreshToken',
          responses: {
            200: { description: 'Nouvel accessToken' },
            401: { description: 'Pas de refresh token' },
            403: { description: 'Refresh token invalide' },
          },
        },
      },
      '/auth/reset-password': {
        post: {
          tags: ['Auth'],
          summary: '[Dev] Réinitialiser le mot de passe',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'newPassword'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    newPassword: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Mot de passe réinitialisé' },
            404: { description: 'Utilisateur introuvable' },
          },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // USERS  (/api/users  et  /users)
      // ─────────────────────────────────────────────────────────────
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'Liste des utilisateurs (pagination, filtres)',
          parameters: [
            { in: 'query', name: 'role', schema: { type: 'string' }, description: "Nom du rôle (ex: 'boutique')" },
            { in: 'query', name: 'unassigned', schema: { type: 'boolean' }, description: 'Exclure ceux déjà liés à une boutique active' },
            { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Recherche par username' },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 50 } },
          ],
          responses: {
            200: { description: '{ data, total, page, limit }' },
          },
        },
        post: {
          tags: ['Users'],
          summary: 'Créer un utilisateur',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'password', 'id_role'],
                  properties: {
                    username: { type: 'string' },
                    password: { type: 'string' },
                    id_role: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Utilisateur créé' },
            400: { description: 'Username déjà pris ou champ manquant' },
          },
        },
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Récupérer un utilisateur par ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Utilisateur trouvé' },
            404: { description: 'Introuvable' },
          },
        },
        put: {
          tags: ['Users'],
          summary: 'Modifier un utilisateur',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string' },
                    email: { type: 'string' },
                    id_role: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Utilisateur mis à jour' },
            404: { description: 'Introuvable' },
          },
        },
        delete: {
          tags: ['Users'],
          summary: 'Supprimer un utilisateur',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Utilisateur supprimé' },
            404: { description: 'Introuvable' },
          },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // ROLES
      // ─────────────────────────────────────────────────────────────
      '/roles': {
        get: {
          tags: ['Roles'],
          summary: 'Liste tous les rôles',
          responses: { 200: { description: 'Tableau de rôles' } },
        },
        post: {
          tags: ['Roles'],
          summary: 'Créer un rôle',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['role_name'],
                  properties: { role_name: { type: 'string' } },
                },
              },
            },
          },
          responses: { 201: { description: 'Rôle créé' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // BOUTIQUES
      // ─────────────────────────────────────────────────────────────
      '/api/boutiques': {
        get: {
          tags: ['Boutiques'],
          summary: 'Liste des boutiques (pagination + filtres)',
          parameters: [
            { in: 'query', name: 'nom', schema: { type: 'string' } },
            { in: 'query', name: 'categorie', schema: { type: 'string' }, description: 'ObjectId catégorie' },
            { in: 'query', name: 'status', schema: { type: 'boolean' } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 50 } },
          ],
          responses: { 200: { description: '{ data, total, page, limit }' } },
        },
        post: {
          tags: ['Boutiques'],
          summary: 'Créer une boutique (multipart, logo optionnel)',
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['nom'],
                  properties: {
                    nom: { type: 'string' },
                    id_categorie: { type: 'string' },
                    local_boutique: { type: 'string' },
                    user_proprietaire: { type: 'string' },
                    logo: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Boutique créée' } },
        },
      },
      '/api/boutiques/unlinked': {
        get: {
          tags: ['Boutiques'],
          summary: 'Boutiques sans propriétaire',
          responses: { 200: { description: '{ data: [...] }' } },
        },
      },
      '/api/boutiques/my-boutique': {
        get: {
          tags: ['Boutiques'],
          summary: 'Boutique de l\'utilisateur connecté (avec articles)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Boutique + articles enrichis' },
            404: { description: 'Aucune boutique associée' },
          },
        },
      },
      '/api/boutiques/user/{userId}': {
        get: {
          tags: ['Boutiques'],
          summary: 'Boutique par userId',
          parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Boutique (ou null)' } },
        },
      },
      '/api/boutiques/{id}': {
        get: {
          tags: ['Boutiques'],
          summary: 'Détail d\'une boutique (avec articles)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Boutique enrichie' },
            404: { description: 'Introuvable' },
          },
        },
        put: {
          tags: ['Boutiques'],
          summary: 'Modifier une boutique (multipart)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    nom: { type: 'string' },
                    id_categorie: { type: 'string' },
                    local_boutique: { type: 'string' },
                    logo: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Boutique mise à jour' }, 404: { description: 'Introuvable' } },
        },
        delete: {
          tags: ['Boutiques'],
          summary: 'Désactiver une boutique (soft delete)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Boutique désactivée' }, 404: { description: 'Introuvable' } },
        },
      },
      '/api/boutiques/{id}/link-user': {
        put: {
          tags: ['Boutiques'],
          summary: 'Lier un utilisateur à une boutique',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId'],
                  properties: { userId: { type: 'string' } },
                },
              },
            },
          },
          responses: { 200: { description: 'Boutique mise à jour' } },
        },
      },
      '/api/boutiques/{id}/assign-user': {
        put: {
          tags: ['Boutiques'],
          summary: 'Assigner / désassigner un utilisateur',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { userId: { type: 'string', nullable: true } },
                },
              },
            },
          },
          responses: { 200: { description: 'Boutique mise à jour' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // ARTICLES
      // ─────────────────────────────────────────────────────────────
      '/articles': {
        get: {
          tags: ['Articles'],
          summary: 'Liste des articles (+ stock + images)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'boutique', schema: { type: 'string' }, description: 'ObjectId de la boutique' },
          ],
          responses: { 200: { description: 'Tableau d\'articles enrichis' } },
        },
        post: {
          tags: ['Articles'],
          summary: 'Créer un article (multipart, images)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['nom', 'prix', 'id_boutique'],
                  properties: {
                    nom: { type: 'string' },
                    description: { type: 'string' },
                    id_categorie_article: { type: 'string' },
                    prix: { type: 'number' },
                    id_boutique: { type: 'string' },
                    stock: { type: 'integer' },
                    seuil_alerte: { type: 'integer' },
                    images: { type: 'array', items: { type: 'string', format: 'binary' } },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Article créé' } },
        },
      },
      '/articles/{id}': {
        get: {
          tags: ['Articles'],
          summary: 'Détail d\'un article',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Article + stock + images' }, 404: { description: 'Introuvable' } },
        },
        put: {
          tags: ['Articles'],
          summary: 'Modifier un article (multipart)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    nom: { type: 'string' },
                    description: { type: 'string' },
                    prix: { type: 'number' },
                    stock: { type: 'integer' },
                    seuil_alerte: { type: 'integer' },
                    images: { type: 'array', items: { type: 'string', format: 'binary' } },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Article mis à jour' }, 404: { description: 'Introuvable' } },
        },
        delete: {
          tags: ['Articles'],
          summary: 'Supprimer un article (+ stock + images blob)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Article supprimé' }, 404: { description: 'Introuvable' } },
        },
      },
      '/articles/{id}/toggle': {
        patch: {
          tags: ['Articles'],
          summary: 'Activer / désactiver un article',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: '{ actif: boolean }' }, 404: { description: 'Introuvable' } },
        },
      },
      '/articles/categories/boutique/{boutiqueId}': {
        get: {
          tags: ['Articles'],
          summary: "Catégories d'articles d'une boutique",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'boutiqueId', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Tableau de catégories' } },
        },
      },
      '/articles/categories': {
        post: {
          tags: ['Articles'],
          summary: "Créer une catégorie d'articles",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nom', 'id_boutique'],
                  properties: {
                    nom: { type: 'string' },
                    id_boutique: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Catégorie créée' } },
        },
      },
      '/articles/categories/{id}': {
        put: {
          tags: ['Articles'],
          summary: "Modifier une catégorie d'articles",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Catégorie mise à jour' } },
        },
        delete: {
          tags: ['Articles'],
          summary: "Supprimer une catégorie d'articles",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Catégorie supprimée' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // STOCKS (mouvementstock)
      // ─────────────────────────────────────────────────────────────
      '/mouvementstock': {
        get: {
          tags: ['Stocks'],
          summary: 'Liste des mouvements de stock',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'boutique_id', schema: { type: 'string' }, description: 'Filtrer par boutique' },
          ],
          responses: { 200: { description: 'Tableau de mouvements' } },
        },
        post: {
          tags: ['Stocks'],
          summary: 'Enregistrer un mouvement de stock',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['id_article', 'quantity', 'type_mouvement'],
                  properties: {
                    id_article: { type: 'string' },
                    quantity: { type: 'integer' },
                    type_mouvement: { type: 'integer', enum: [1, 2], description: '1 = entrée, 2 = sortie' },
                    seuil_alerte: { type: 'integer', default: 5 },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Mouvement créé' } },
        },
      },
      '/mouvementstock/current-stocks': {
        get: {
          tags: ['Stocks'],
          summary: 'Stocks actuels calculés (entrées - sorties)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'boutique_id', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Tableau { id, nom, stock_entree, stock_sortie, stock_restant, seuil_alerte, img_url }' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // COMMANDES
      // ─────────────────────────────────────────────────────────────
      '/api/commandes': {
        get: {
          tags: ['Commandes'],
          summary: "Commandes de l'utilisateur connecté",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Tableau de commandes' } },
        },
      },
      '/api/commandes/checkout': {
        post: {
          tags: ['Commandes'],
          summary: 'Valider le panier (checkout) — crée 1 commande par boutique',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['methodePaiement', 'clientNom', 'clientEmail'],
                  properties: {
                    methodePaiement: { type: 'string' },
                    clientNom: { type: 'string' },
                    clientEmail: { type: 'string', format: 'email' },
                    clientTelephone: { type: 'string' },
                    clientAdresse: { type: 'string' },
                    typeLivraison: { type: 'string', enum: ['standard', 'livraison'] },
                    lieuLivraison: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: '{ commandes: [...] }' },
            400: { description: 'Panier vide' },
            409: { description: 'Stock insuffisant' },
          },
        },
      },
      '/api/commandes/boutique': {
        get: {
          tags: ['Commandes'],
          summary: "Commandes de la boutique du vendeur connecté (vue seller)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'status', schema: { type: 'string' } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          ],
          responses: { 200: { description: '{ data, total, page, limit }' } },
        },
      },
      '/api/commandes/boutique/stats': {
        get: {
          tags: ['Commandes'],
          summary: 'KPIs agrégés du vendeur (CA, meilleures ventes…)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Stats agrégées' } },
        },
      },
      '/api/commandes/{id}': {
        get: {
          tags: ['Commandes'],
          summary: 'Détail d\'une commande',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Commande' }, 404: { description: 'Introuvable' } },
        },
      },
      '/api/commandes/{id}/status': {
        put: {
          tags: ['Commandes'],
          summary: 'Mettre à jour le statut d\'une commande (seller uniquement)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['EN_ATTENTE', 'VALIDEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE'],
                    },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Commande mise à jour' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // PAYMENTS (loyers)
      // ─────────────────────────────────────────────────────────────
      '/api/payments': {
        get: {
          tags: ['Payments'],
          summary: 'Liste tous les paiements',
          responses: { 200: { description: 'Tableau de paiements' } },
        },
      },
      '/api/payments/month/{mois}/{annee}': {
        get: {
          tags: ['Payments'],
          summary: 'Paiements par mois/année',
          parameters: [
            { in: 'path', name: 'mois', required: true, schema: { type: 'integer' } },
            { in: 'path', name: 'annee', required: true, schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'Tableau de paiements' } },
        },
      },
      '/api/payments/status/{status}': {
        get: {
          tags: ['Payments'],
          summary: 'Paiements par statut',
          parameters: [
            {
              in: 'path', name: 'status', required: true,
              schema: { type: 'string', enum: ['en_attente', 'paye', 'en_retard'] },
            },
          ],
          responses: { 200: { description: 'Tableau de paiements' } },
        },
      },
      '/api/payments/check-overdue/run': {
        get: {
          tags: ['Payments'],
          summary: 'Déclencher manuellement la vérification des retards',
          responses: { 200: { description: '{ updated }' } },
        },
      },
      '/api/payments/{id}': {
        get: {
          tags: ['Payments'],
          summary: 'Détail d\'un paiement',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Paiement' }, 404: { description: 'Introuvable' } },
        },
        delete: {
          tags: ['Payments'],
          summary: 'Supprimer un paiement',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Paiement supprimé' } },
        },
      },
      '/api/payments/{id}/invoice-pdf': {
        get: {
          tags: ['Payments'],
          summary: 'Télécharger la facture PDF',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Fichier PDF (application/pdf)' } },
        },
      },
      '/api/payments/{id}/mark-paid': {
        put: {
          tags: ['Payments'],
          summary: 'Marquer un paiement comme payé + email confirmation',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Paiement mis à jour' } },
        },
      },
      '/api/payments/{id}/send-reminder': {
        post: {
          tags: ['Payments'],
          summary: "Envoyer un email de rappel de retard",
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Résultat envoi email' } },
        },
      },
      '/api/payments/{id}/send-invoice': {
        post: {
          tags: ['Payments'],
          summary: 'Envoyer la facture PDF par email',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Résultat envoi email' } },
        },
      },
      '/api/payments/generate-current-month': {
        post: {
          tags: ['Payments'],
          summary: 'Générer les paiements du mois en cours pour tous les contrats actifs',
          responses: { 200: { description: '{ created, skipped }' } },
        },
      },
      '/api/payments/auto-generate-all': {
        post: {
          tags: ['Payments'],
          summary: 'Générer rétroactivement tous les paiements manquants depuis la date de début des contrats',
          responses: { 200: { description: '{ created, skipped }' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // CONTRACTS
      // ─────────────────────────────────────────────────────────────
      '/api/contracts': {
        get: {
          tags: ['Contracts'],
          summary: 'Liste tous les contrats',
          responses: { 200: { description: 'Tableau de contrats' } },
        },
        post: {
          tags: ['Contracts'],
          summary: 'Créer un contrat',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['contract_type', 'id_boutique', 'date_debut', 'date_fin', 'loyer'],
                  properties: {
                    contract_type: { type: 'string', description: 'ObjectId ContractType' },
                    id_boutique: { type: 'string' },
                    id_client: { type: 'string' },
                    date_debut: { type: 'string', format: 'date' },
                    date_fin: { type: 'string', format: 'date' },
                    loyer: { type: 'number' },
                    nom_entreprise: { type: 'string' },
                    nom_client: { type: 'string' },
                    numero: { type: 'string' },
                    etage: { type: 'integer' },
                    surface: { type: 'number' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Contrat créé' } },
        },
      },
      '/api/contracts/{id}': {
        get: {
          tags: ['Contracts'],
          summary: 'Détail d\'un contrat',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Contrat' }, 404: { description: 'Introuvable' } },
        },
        put: {
          tags: ['Contracts'],
          summary: 'Modifier un contrat',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Contrat mis à jour' } },
        },
        delete: {
          tags: ['Contracts'],
          summary: 'Supprimer un contrat',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Contrat supprimé' } },
        },
      },
      '/api/contracts/{id}/pdf': {
        get: {
          tags: ['Contracts'],
          summary: 'Télécharger le contrat en PDF',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Fichier PDF (application/pdf)' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // CONTRACT TYPES
      // ─────────────────────────────────────────────────────────────
      '/api/contract-types': {
        get: {
          tags: ['ContractTypes'],
          summary: 'Liste tous les types de contrats',
          responses: { 200: { description: 'Tableau de types' } },
        },
        post: {
          tags: ['ContractTypes'],
          summary: 'Créer un type de contrat',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['contract_type_name'],
                  properties: { contract_type_name: { type: 'string' } },
                },
              },
            },
          },
          responses: { 201: { description: 'Type créé' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // CATEGORIES BOUTIQUES
      // ─────────────────────────────────────────────────────────────
      '/api/categories': {
        get: {
          tags: ['Categories'],
          summary: 'Liste toutes les catégories de boutiques',
          responses: { 200: { description: 'Tableau de catégories' } },
        },
        post: {
          tags: ['Categories'],
          summary: 'Créer une catégorie de boutiques',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nom'],
                  properties: { nom: { type: 'string' } },
                },
              },
            },
          },
          responses: { 201: { description: 'Catégorie créée' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // LOCAUX
      // ─────────────────────────────────────────────────────────────
      '/api/locaux': {
        get: {
          tags: ['Locaux'],
          summary: 'Liste tous les locaux',
          parameters: [
            { in: 'query', name: 'status', schema: { type: 'boolean' }, description: 'true = disponible' },
          ],
          responses: { 200: { description: 'Tableau de locaux' } },
        },
        post: {
          tags: ['Locaux'],
          summary: 'Créer un local',
          responses: { 201: { description: 'Local créé' } },
        },
      },
      '/api/locaux/{id}': {
        get: {
          tags: ['Locaux'],
          summary: 'Détail d\'un local',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Local' }, 404: { description: 'Introuvable' } },
        },
        put: {
          tags: ['Locaux'],
          summary: 'Modifier un local',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Local mis à jour' } },
        },
        delete: {
          tags: ['Locaux'],
          summary: 'Supprimer un local',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Local supprimé' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // NOTIFICATIONS
      // ─────────────────────────────────────────────────────────────
      '/api/notifications': {
        get: {
          tags: ['Notifications'],
          summary: "Notifications visibles par l'utilisateur connecté",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Tableau de notifications' } },
        },
        post: {
          tags: ['Notifications'],
          summary: 'Créer une notification (admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['titre', 'message'],
                  properties: {
                    titre: { type: 'string' },
                    message: { type: 'string' },
                    type: { type: 'string', enum: ['info', 'success', 'warning', 'error', 'paiement', 'commande', 'stock'] },
                    lien: { type: 'string' },
                    destinataire_user: { type: 'string', description: 'ObjectId user (exclusif)' },
                    destinataire_role: { type: 'string', description: "Nom du rôle (ex: 'boutique')" },
                    global: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Notification créée' }, 400: { description: 'Champ manquant' } },
        },
      },
      '/api/notifications/unread-count': {
        get: {
          tags: ['Notifications'],
          summary: 'Compteur de notifications non lues',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: '{ count: number }' } },
        },
      },
      '/api/notifications/read-all': {
        put: {
          tags: ['Notifications'],
          summary: 'Marquer toutes les notifications comme lues',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'OK' } },
        },
      },
      '/api/notifications/{id}/read': {
        put: {
          tags: ['Notifications'],
          summary: 'Marquer une notification comme lue',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Notification mise à jour' }, 404: { description: 'Introuvable' } },
        },
      },
      '/api/notifications/{id}': {
        delete: {
          tags: ['Notifications'],
          summary: 'Supprimer une notification',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Notification supprimée' }, 404: { description: 'Introuvable' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // PROMOTIONS
      // ─────────────────────────────────────────────────────────────
      '/api/promotions': {
        get: {
          tags: ['Promotions'],
          summary: 'Liste des promotions',
          responses: { 200: { description: 'Tableau de promotions' } },
        },
        post: {
          tags: ['Promotions'],
          summary: 'Créer une promotion',
          responses: { 201: { description: 'Promotion créée' } },
        },
      },
      '/api/promotions/{id}': {
        get: {
          tags: ['Promotions'],
          summary: 'Détail d\'une promotion',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Promotion' } },
        },
        put: {
          tags: ['Promotions'],
          summary: 'Modifier une promotion',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Promotion mise à jour' } },
        },
        delete: {
          tags: ['Promotions'],
          summary: 'Supprimer une promotion',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Promotion supprimée' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // BUCKET (panier)
      // ─────────────────────────────────────────────────────────────
      '/api/bucket': {
        get: {
          tags: ['Bucket'],
          summary: "Récupérer le panier de l'utilisateur connecté",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Panier' } },
        },
      },
      '/api/bucket/add': {
        post: {
          tags: ['Bucket'],
          summary: 'Ajouter un article au panier',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Panier mis à jour' } },
        },
      },
      '/api/bucket/remove/{articleId}': {
        delete: {
          tags: ['Bucket'],
          summary: 'Retirer un article du panier',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'articleId', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Panier mis à jour' } },
        },
      },
      '/api/bucket/clear': {
        delete: {
          tags: ['Bucket'],
          summary: 'Vider le panier',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Panier vidé' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // FAVORITES
      // ─────────────────────────────────────────────────────────────
      '/api/favorites': {
        get: {
          tags: ['Favorites'],
          summary: "Favoris de l'utilisateur connecté",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Tableau de favoris' } },
        },
        post: {
          tags: ['Favorites'],
          summary: 'Ajouter un favori',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Favori créé' } },
        },
      },
      '/api/favorites/{id}': {
        delete: {
          tags: ['Favorites'],
          summary: 'Supprimer un favori',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Favori supprimé' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // AVIS
      // ─────────────────────────────────────────────────────────────
      '/api/avis': {
        get: {
          tags: ['Avis'],
          summary: 'Liste des avis',
          responses: { 200: { description: 'Tableau d\'avis' } },
        },
        post: {
          tags: ['Avis'],
          summary: 'Déposer un avis',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Avis créé' } },
        },
      },
      '/api/avis/{id}': {
        delete: {
          tags: ['Avis'],
          summary: 'Supprimer un avis',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Avis supprimé' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // HORAIRES
      // ─────────────────────────────────────────────────────────────
      '/horaire': {
        get: {
          tags: ['Horaires'],
          summary: "Horaires d'ouverture",
          responses: { 200: { description: 'Tableau d\'horaires' } },
        },
        post: {
          tags: ['Horaires'],
          summary: "Créer/Modifier les horaires d'une boutique",
          responses: { 200: { description: 'Horaires enregistrés' } },
        },
      },
      '/horaire/{id}': {
        get: {
          tags: ['Horaires'],
          summary: "Horaires d'une boutique",
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Horaires' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // FAQs
      // ─────────────────────────────────────────────────────────────
      '/faqs': {
        get: {
          tags: ['FAQs'],
          summary: 'Liste des FAQs',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Tableau de FAQs' } },
        },
        post: {
          tags: ['FAQs'],
          summary: 'Créer une FAQ',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'FAQ créée' } },
        },
      },
      '/faqs/{id}': {
        put: {
          tags: ['FAQs'],
          summary: 'Modifier une FAQ',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'FAQ mise à jour' } },
        },
        delete: {
          tags: ['FAQs'],
          summary: 'Supprimer une FAQ',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'FAQ supprimée' } },
        },
      },
      '/faqCategories': {
        get: {
          tags: ['FAQs'],
          summary: 'Liste des catégories FAQ',
          responses: { 200: { description: 'Tableau de catégories FAQ' } },
        },
        post: {
          tags: ['FAQs'],
          summary: 'Créer une catégorie FAQ',
          responses: { 201: { description: 'Catégorie créée' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // CONVERSATIONS & MESSAGES
      // ─────────────────────────────────────────────────────────────
      '/conversations': {
        get: {
          tags: ['Conversations'],
          summary: "Conversations de l'utilisateur connecté",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Tableau de conversations' } },
        },
        post: {
          tags: ['Conversations'],
          summary: 'Créer ou récupérer une conversation',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Conversation' } },
        },
      },
      '/conversations/{id}': {
        get: {
          tags: ['Conversations'],
          summary: 'Détail d\'une conversation',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Conversation' } },
        },
      },
      '/messages': {
        get: {
          tags: ['Messages'],
          summary: 'Messages d\'une conversation',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'conversation_id', required: true, schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Tableau de messages' } },
        },
        post: {
          tags: ['Messages'],
          summary: 'Envoyer un message',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Message envoyé' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // SITE CRM
      // ─────────────────────────────────────────────────────────────
      '/sitecrm': {
        get: {
          tags: ['SiteCRM'],
          summary: 'Paramètres CRM du site',
          responses: { 200: { description: 'Paramètres CRM' } },
        },
        post: {
          tags: ['SiteCRM'],
          summary: 'Enregistrer les paramètres CRM',
          responses: { 200: { description: 'Paramètres sauvegardés' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // SITE CONTENU
      // ─────────────────────────────────────────────────────────────
      '/sitecontenu': {
        get: {
          tags: ['SiteContenu'],
          summary: 'Contenu éditorial du site',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Contenu' } },
        },
        put: {
          tags: ['SiteContenu'],
          summary: 'Modifier le contenu du site',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Contenu mis à jour' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // IMG SLIDER
      // ─────────────────────────────────────────────────────────────
      '/imgslider': {
        get: {
          tags: ['ImgSlider'],
          summary: 'Images du slider homepage',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Tableau d\'images' } },
        },
        post: {
          tags: ['ImgSlider'],
          summary: 'Ajouter une image au slider',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Image ajoutée' } },
        },
      },
      '/imgslider/{id}': {
        delete: {
          tags: ['ImgSlider'],
          summary: 'Supprimer une image du slider',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Image supprimée' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // ADMIN DASHBOARD
      // ─────────────────────────────────────────────────────────────
      '/admin/stats': {
        get: {
          tags: ['Admin'],
          summary: 'Statistiques globales pour le dashboard admin',
          responses: { 200: { description: 'KPIs admin' } },
        },
      },

      // ─────────────────────────────────────────────────────────────
      // BUCKET STORAGE (Vercel Blob)
      // ─────────────────────────────────────────────────────────────
      '/api/bucket/list': {
        get: {
          tags: ['Bucket Storage'],
          summary: 'Lister les fichiers dans Vercel Blob',
          responses: { 200: { description: 'Liste des blobs' } },
        },
      },
      '/api/bucket/delete': {
        delete: {
          tags: ['Bucket Storage'],
          summary: 'Supprimer un fichier du Blob storage',
          responses: { 200: { description: 'Fichier supprimé' } },
        },
      },
    },
  },
  apis: [], // Spec définie inline — pas de scan JSDoc
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
