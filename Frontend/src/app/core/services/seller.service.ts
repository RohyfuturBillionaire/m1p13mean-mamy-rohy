import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, of, map, catchError } from 'rxjs';
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
import {
  MOCK_SELLER_USER,
  MOCK_SELLER_BOUTIQUE,
  MOCK_SELLER_PRODUITS,
  MOCK_STOCK_MOVEMENTS,
  MOCK_SELLER_LIVRAISONS,
  MOCK_SELLER_PROMOTIONS,
  MOCK_SELLER_FAQ,
  MOCK_SELLER_CONVERSATIONS,
  MOCK_SELLER_MESSAGES,
  MOCK_COMMANDES_VS_LIVRAISONS,
  MOCK_STOCK_STATUS
} from '../data/seller-mock-data';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { BoutiqueApiService } from './boutique-api.service';
import { OrderApiService } from './order-api.service';
import { CommandeApi } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  // =============================================
  // STATE
  // =============================================
  private readonly API_URL = `${environment.apiUrl}/api/boutiques/user`; // Base URL for backend API
  private isAuthenticated = signal(false);
  private currentUser = signal<SellerUser | null>(null);
  private boutique = signal<SellerBoutique | null>(null);
  private produits = signal<SellerProduit[]>([]);
  private stockMovements = signal<StockMovement[]>([]);
  private commandes = signal<SellerCommande[]>([]);
  private livraisons = signal<SellerLivraison[]>([]);
  private promotions = signal<SellerPromotion[]>([]);
  private faqs = signal<SellerFAQ[]>([]);
  private conversations = signal<SellerConversation[]>([]);
  private messages = signal<SellerMessage[]>([]);

  // =============================================
  // COMPUTED
  // =============================================
  unreadMessagesCount = computed(() =>
    this.conversations().reduce((acc, conv) => acc + conv.nonLus, 0)
  );

  lowStockProducts = computed(() =>
    this.produits().filter(p => p.stock <= p.stockAlerte && p.stock > 0)
  );

  outOfStockProducts = computed(() =>
    this.produits().filter(p => p.stock === 0)
  );

  pendingOrders = computed(() =>
    this.commandes().filter(c => c.statut === 'en_attente' || c.statut === 'payee')
  );


  private orderApi = inject(OrderApiService);

  constructor(private http: HttpClient,private boutiqueApi: BoutiqueApiService) {
    this.loadInitialData();
  }


  private loadInitialData(): void {
    this.produits.set([...MOCK_SELLER_PRODUITS]);
    this.stockMovements.set([...MOCK_STOCK_MOVEMENTS]);
    this.livraisons.set([...MOCK_SELLER_LIVRAISONS]);
    this.promotions.set([...MOCK_SELLER_PROMOTIONS]);
    this.faqs.set([...MOCK_SELLER_FAQ]);
    this.conversations.set([...MOCK_SELLER_CONVERSATIONS]);
    this.messages.set([...MOCK_SELLER_MESSAGES]);
  }

  // =============================================
  // STATUS MAPPING (backend uppercase ↔ frontend lowercase)
  // =============================================
  private statusToFrontend(status: string): SellerCommande['statut'] {
    const mapping: Record<string, SellerCommande['statut']> = {
      'EN_ATTENTE': 'en_attente',
      'VALIDEE': 'payee',
      'EN_PREPARATION': 'en_preparation',
      'EXPEDIEE': 'expediee',
      'LIVREE': 'livree',
      'ANNULEE': 'annulee'
    };
    return mapping[status] || 'en_attente';
  }

  private statusToBackend(statut: SellerCommande['statut']): string {
    const mapping: Record<string, string> = {
      'en_attente': 'EN_ATTENTE',
      'payee': 'VALIDEE',
      'en_preparation': 'EN_PREPARATION',
      'expediee': 'EXPEDIEE',
      'livree': 'LIVREE',
      'annulee': 'ANNULEE'
    };
    return mapping[statut] || 'EN_ATTENTE';
  }

  private mapApiToSellerCommande(c: CommandeApi): SellerCommande {
    return {
      id: c._id,
      numeroCommande: c.numero_commande,
      boutiqueId: typeof c.id_boutique === 'object' ? c.id_boutique._id : c.id_boutique,
      clientId: typeof c.id_client === 'object' ? c.id_client._id : c.id_client,
      clientNom: c.client_nom,
      clientEmail: c.client_email,
      clientTelephone: c.client_telephone,
      clientAdresse: c.client_adresse,
      items: (c.articles || []).map(a => ({
        produitId: a.id_article,
        produitNom: a.nom,
        produitImage: '',
        quantite: a.quantite,
        prixUnitaire: a.prix,
        total: a.prix * a.quantite
      })),
      sousTotal: c.total / 1.2,
      tva: c.total - c.total / 1.2,
      fraisLivraison: 0,
      total: c.total,
      statut: this.statusToFrontend(c.status),
      methodePaiement: c.methode_paiement,
      dateCommande: new Date(c.date_commande)
    };
  }

  // =============================================
  // AUTHENTICATION (uses localStorage from real login)
  // =============================================
  isLoggedIn(): boolean {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const role = (userData?.user?.role || '').toLowerCase();
      return role === 'boutique';
    } catch {
      return false;
    }
  }
  getBoutiqueInfo(idUser: any): Observable<any> {
    return this.http.get(`${this.API_URL}/${idUser}`);
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.boutique.set(null);
    localStorage.removeItem('user');
  }

  getCurrentUser(): SellerUser | null {
    return this.currentUser();
  }

  getBoutiqueId(): string | null {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      return userData?.user?.boutiqueId || null;
    } catch {
      return null;
    }
  }

  // =============================================
  // BOUTIQUE (real API for fetch, mock for rest)
  // =============================================
  getBoutique(): Observable<SellerBoutique | null> {
    const boutiqueId = this.getBoutiqueId();
    if (boutiqueId) {
      return this.boutiqueApi.getMyBoutique().pipe(
        map(b => {
          // Map API response to SellerBoutique shape for compatibility
          const sellerBoutique: SellerBoutique = {
            ...MOCK_SELLER_BOUTIQUE,
            id: b._id,
            nom: b.nom,
            description: b.description || MOCK_SELLER_BOUTIQUE.description,
            email: b.email || MOCK_SELLER_BOUTIQUE.email,
            logo: b.logo ? (b.logo.startsWith('http') ? b.logo : 'http://localhost:5000' + b.logo) : MOCK_SELLER_BOUTIQUE.logo,
          };
          this.boutique.set(sellerBoutique);
          return sellerBoutique;
        })
      );
    }
    return of(this.boutique());
  }

  updateBoutique(updates: Partial<SellerBoutique>): Observable<SellerBoutique> {
    const current = this.boutique();
    if (current) {
      const updated = { ...current, ...updates };
      this.boutique.set(updated);
      return of(updated);
    }
    return of(MOCK_SELLER_BOUTIQUE);
  }

  toggleBoutiqueStatus(): Observable<boolean> {
    const current = this.boutique();
    if (current) {
      const updated = { ...current, estOuvert: !current.estOuvert };
      this.boutique.set(updated);
      return of(updated.estOuvert);
    }
    return of(false);
  }

  // =============================================
  // PRODUCTS
  // =============================================
  getProduits(): Observable<SellerProduit[]> {
    return of(this.produits());
  }

  getProduitById(id: string): Observable<SellerProduit | undefined> {
    return of(this.produits().find(p => p.id === id));
  }

  addProduit(produit: Omit<SellerProduit, 'id' | 'dateCreation' | 'dateModification' | 'vendu'>): Observable<SellerProduit> {
    const newProduit: SellerProduit = {
      ...produit,
      id: `p${Date.now()}`,
      dateCreation: new Date(),
      dateModification: new Date(),
      vendu: 0
    };
    this.produits.update(produits => [...produits, newProduit]);
    return of(newProduit);
  }

  updateProduit(id: string, updates: Partial<SellerProduit>): Observable<SellerProduit | undefined> {
    const index = this.produits().findIndex(p => p.id === id);
    if (index >= 0) {
      const updated = { ...this.produits()[index], ...updates, dateModification: new Date() };
      this.produits.update(produits => {
        const newProduits = [...produits];
        newProduits[index] = updated;
        return newProduits;
      });
      return of(updated);
    }
    return of(undefined);
  }

  deleteProduit(id: string): Observable<boolean> {
    this.produits.update(produits => produits.filter(p => p.id !== id));
    return of(true);
  }

  toggleProduitStatus(id: string): Observable<SellerProduit | undefined> {
    const produit = this.produits().find(p => p.id === id);
    if (produit) {
      const newStatut = produit.statut === 'actif' ? 'inactif' : 'actif';
      return this.updateProduit(id, { statut: newStatut });
    }
    return of(undefined);
  }

  // =============================================
  // STOCK
  // =============================================
  getStockMovements(): Observable<StockMovement[]> {
    return of(this.stockMovements());
  }

  addStockMovement(movement: Omit<StockMovement, 'id' | 'date'>): Observable<StockMovement> {
    const newMovement: StockMovement = {
      ...movement,
      id: `sm${Date.now()}`,
      date: new Date()
    };
    this.stockMovements.update(movements => [newMovement, ...movements]);

    // Update product stock
    const produit = this.produits().find(p => p.id === movement.produitId);
    if (produit) {
      this.updateProduit(movement.produitId, {
        stock: movement.stockApres,
        statut: movement.stockApres === 0 ? 'rupture' : produit.statut === 'rupture' ? 'actif' : produit.statut
      });
    }

    return of(newMovement);
  }

  getStockAlerts(): Observable<{ lowStock: SellerProduit[], outOfStock: SellerProduit[] }> {
    const boutiqueId = this.getBoutiqueId();
    const url = boutiqueId
      ? `${environment.apiUrl}/mouvementstock/current-stocks?boutique_id=${boutiqueId}`
      : `${environment.apiUrl}/mouvementstock/current-stocks`;
    return this.http.get<any[]>(url).pipe(
      map(items => {
        const produits: SellerProduit[] = items.map(item => ({
          id: item.id,
          boutiqueId: '',
          nom: item.nom,
          description: '',
          prix: 0,
          categorie: '',
          image: item.img_url || '',
          stock: item.stock_restant,
          stockAlerte: item.seuil_alerte ?? 5,
          statut: item.stock_restant <= 0 ? 'rupture' : 'actif',
          nouveau: false,
          dateCreation: new Date(),
          dateModification: new Date(),
          vendu: 0
        }));
        return {
          outOfStock: produits.filter(p => p.stock <= 0),
          lowStock: produits.filter(p => p.stock > 0 && p.stock <= p.stockAlerte)
        };
      }),
      catchError(() => of({ lowStock: this.lowStockProducts(), outOfStock: this.outOfStockProducts() }))
    );
  }

  // =============================================
  // ORDERS (real API)
  // =============================================
  getCommandes(): Observable<SellerCommande[]> {
    return this.orderApi.getBoutiqueOrders({ limit: 100 }).pipe(
      map(res => {
        const mapped = res.data.map(c => this.mapApiToSellerCommande(c));
        this.commandes.set(mapped);
        return mapped;
      }),
      catchError(() => of(this.commandes()))
    );
  }

  getCommandeById(id: string): Observable<SellerCommande | undefined> {
    return this.orderApi.getOrder(id).pipe(
      map(c => this.mapApiToSellerCommande(c)),
      catchError(() => of(undefined))
    );
  }

  updateCommandeStatut(id: string, statut: SellerCommande['statut']): Observable<SellerCommande | undefined> {
    const backendStatus = this.statusToBackend(statut);
    return this.orderApi.updateOrderStatus(id, backendStatus).pipe(
      map(c => {
        const mapped = this.mapApiToSellerCommande(c);
        // Update local signal
        this.commandes.update(commandes =>
          commandes.map(cmd => cmd.id === id ? mapped : cmd)
        );
        return mapped;
      }),
      catchError(() => of(undefined))
    );
  }

  // =============================================
  // DELIVERIES
  // =============================================
  getLivraisons(): Observable<SellerLivraison[]> {
    return of(this.livraisons());
  }

  getLivraisonByCommande(commandeId: string): Observable<SellerLivraison | undefined> {
    return of(this.livraisons().find(l => l.commandeId === commandeId));
  }

  createLivraison(commandeId: string): Observable<SellerLivraison> {
    const commande = this.commandes().find(c => c.id === commandeId);
    const newLivraison: SellerLivraison = {
      id: `liv${Date.now()}`,
      commandeId,
      numeroSuivi: `TC-LIV-${new Date().getFullYear()}-${String(this.livraisons().length + 1).padStart(4, '0')}`,
      transporteur: 'Tana Express',
      statut: 'en_preparation',
      adresseLivraison: commande?.clientAdresse || '',
      dateExpedition: new Date(),
      dateEstimee: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 days
      historique: [
        { date: new Date(), statut: 'Colis pris en charge', lieu: 'Tana Center' }
      ]
    };
    this.livraisons.update(livraisons => [...livraisons, newLivraison]);
    return of(newLivraison);
  }

  updateLivraisonStatut(id: string, statut: SellerLivraison['statut'], lieu: string): Observable<SellerLivraison | undefined> {
    const index = this.livraisons().findIndex(l => l.id === id);
    if (index >= 0) {
      const livraison = this.livraisons()[index];
      const updated: SellerLivraison = {
        ...livraison,
        statut,
        historique: [
          ...livraison.historique,
          { date: new Date(), statut: this.getStatutLabel(statut), lieu }
        ]
      };
      if (statut === 'livree') {
        updated.dateLivraison = new Date();
      }
      this.livraisons.update(livraisons => {
        const newLivraisons = [...livraisons];
        newLivraisons[index] = updated;
        return newLivraisons;
      });
      return of(updated);
    }
    return of(undefined);
  }

  private getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'en_preparation': 'En préparation',
      'expediee': 'Expédié',
      'en_transit': 'En transit',
      'livree': 'Livré'
    };
    return labels[statut] || statut;
  }

  // =============================================
  // PROMOTIONS
  // =============================================
  getPromotions(): Observable<SellerPromotion[]> {
    return of(this.promotions());
  }

  getPromotionById(id: string): Observable<SellerPromotion | undefined> {
    return of(this.promotions().find(p => p.id === id));
  }

  addPromotion(promo: Omit<SellerPromotion, 'id' | 'dateCreation'>): Observable<SellerPromotion> {
    const newPromo: SellerPromotion = {
      ...promo,
      id: `promo${Date.now()}`,
      dateCreation: new Date()
    };
    this.promotions.update(promotions => [...promotions, newPromo]);
    return of(newPromo);
  }

  updatePromotion(id: string, updates: Partial<SellerPromotion>): Observable<SellerPromotion | undefined> {
    const index = this.promotions().findIndex(p => p.id === id);
    if (index >= 0) {
      const updated = { ...this.promotions()[index], ...updates };
      this.promotions.update(promotions => {
        const newPromotions = [...promotions];
        newPromotions[index] = updated;
        return newPromotions;
      });
      return of(updated);
    }
    return of(undefined);
  }

  deletePromotion(id: string): Observable<boolean> {
    this.promotions.update(promotions => promotions.filter(p => p.id !== id));
    return of(true);
  }

  submitPromotion(id: string): Observable<SellerPromotion | undefined> {
    return this.updatePromotion(id, {
      statut: 'en_attente',
      dateSoumission: new Date()
    });
  }

  // =============================================
  // FAQ
  // =============================================
  getFAQs(): Observable<SellerFAQ[]> {
    return of(this.faqs().sort((a, b) => a.ordre - b.ordre));
  }

  addFAQ(faq: Omit<SellerFAQ, 'id' | 'dateCreation' | 'dateModification'>): Observable<SellerFAQ> {
    const newFAQ: SellerFAQ = {
      ...faq,
      id: `faq${Date.now()}`,
      dateCreation: new Date(),
      dateModification: new Date()
    };
    this.faqs.update(faqs => [...faqs, newFAQ]);
    return of(newFAQ);
  }

  updateFAQ(id: string, updates: Partial<SellerFAQ>): Observable<SellerFAQ | undefined> {
    const index = this.faqs().findIndex(f => f.id === id);
    if (index >= 0) {
      const updated = { ...this.faqs()[index], ...updates, dateModification: new Date() };
      this.faqs.update(faqs => {
        const newFAQs = [...faqs];
        newFAQs[index] = updated;
        return newFAQs;
      });
      return of(updated);
    }
    return of(undefined);
  }

  deleteFAQ(id: string): Observable<boolean> {
    this.faqs.update(faqs => faqs.filter(f => f.id !== id));
    return of(true);
  }

  // =============================================
  // MESSAGES
  // =============================================
  getConversations(): Observable<SellerConversation[]> {
    return of(this.conversations().sort((a, b) =>
      new Date(b.dateLastMessage).getTime() - new Date(a.dateLastMessage).getTime()
    ));
  }

  getMessages(conversationId: string): Observable<SellerMessage[]> {
    return of(this.messages()
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  }

  sendMessage(conversationId: string, contenu: string): Observable<SellerMessage> {
    const user = this.currentUser();
    const newMessage: SellerMessage = {
      id: `msg${Date.now()}`,
      conversationId,
      expediteurId: user?.id || 'seller-1',
      expediteurNom: this.boutique()?.nom || 'Boutique',
      expediteurRole: 'boutique',
      contenu,
      date: new Date(),
      lu: true
    };
    this.messages.update(messages => [...messages, newMessage]);

    // Update conversation
    const convIndex = this.conversations().findIndex(c => c.id === conversationId);
    if (convIndex >= 0) {
      this.conversations.update(conversations => {
        const newConversations = [...conversations];
        newConversations[convIndex] = {
          ...newConversations[convIndex],
          dernierMessage: contenu,
          dateLastMessage: new Date()
        };
        return newConversations;
      });
    }

    return of(newMessage);
  }

  markConversationAsRead(conversationId: string): void {
    // Mark messages as read
    this.messages.update(messages =>
      messages.map(m =>
        m.conversationId === conversationId && !m.lu && m.expediteurRole !== 'boutique'
          ? { ...m, lu: true }
          : m
      )
    );

    // Update conversation unread count
    const convIndex = this.conversations().findIndex(c => c.id === conversationId);
    if (convIndex >= 0) {
      this.conversations.update(conversations => {
        const newConversations = [...conversations];
        newConversations[convIndex] = { ...newConversations[convIndex], nonLus: 0 };
        return newConversations;
      });
    }
  }

  // =============================================
  // NOTIFICATIONS
  // =============================================
  getUnreadMessagesCount(): number {
    return this.unreadMessagesCount();
  }

  getStockAlertsArray(): SellerProduit[] {
    return [...this.lowStockProducts(), ...this.outOfStockProducts()];
  }

  // =============================================
  // DASHBOARD DATA (real API for KPIs/charts, mock for the rest)
  // =============================================
  getKPIs(): Observable<SellerKPI[]> {
    return this.orderApi.getBoutiqueStats().pipe(
      map(stats => {
        const kpis: SellerKPI[] = [
          {
            id: 'revenu',
            label: 'Revenu total',
            valeur: stats.totalRevenu,
            unite: 'Ar',
            evolution: 0,
            icon: 'payments',
            couleur: '#10B981'
          },
          {
            id: 'commandes',
            label: 'Commandes',
            valeur: stats.nbCommandes,
            unite: '',
            evolution: 0,
            icon: 'shopping_cart',
            couleur: '#3B82F6'
          },
          {
            id: 'articles',
            label: 'Articles vendus',
            valeur: stats.totalArticlesVendus,
            unite: '',
            evolution: 0,
            icon: 'inventory_2',
            couleur: '#8B5CF6'
          },
          {
            id: 'panier_moyen',
            label: 'Panier moyen',
            valeur: stats.nbCommandes > 0 ? Math.round(stats.totalRevenu / stats.nbCommandes) : 0,
            unite: 'Ar',
            evolution: 0,
            icon: 'shopping_basket',
            couleur: '#F59E0B'
          }
        ];
        return kpis;
      }),
      catchError(() => of([]))
    );
  }

  getVentesMensuelles(): Observable<SellerChartData> {
    return this.orderApi.getBoutiqueStats().pipe(
      map(stats => {
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const sorted = [...(stats.monthly || [])].sort((a, b) =>
          a.year !== b.year ? a.year - b.year : a.month - b.month
        );
        return {
          labels: sorted.map(m => `${monthNames[m.month - 1]} ${m.year}`),
          datasets: [{
            label: 'Revenus',
            data: sorted.map(m => m.revenu),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          }]
        };
      }),
      catchError(() => of({ labels: [], datasets: [] }))
    );
  }

  getBestSellers(): Observable<SellerChartData> {
    return this.orderApi.getBoutiqueStats().pipe(
      map(stats => {
        const top = (stats.bestSellers || []).slice(0, 5);
        return {
          labels: top.map(b => b.nom),
          datasets: [{
            label: 'Vendus',
            data: top.map(b => b.totalVendu),
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
          }]
        };
      }),
      catchError(() => of({ labels: [], datasets: [] }))
    );
  }

  getCommandesVsLivraisons(): Observable<SellerChartData> {
    return of(MOCK_COMMANDES_VS_LIVRAISONS);
  }

  getStockStatus(): Observable<SellerChartData> {
    return of(MOCK_STOCK_STATUS);
  }

  // =============================================
  // UTILITIES
  // =============================================
  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-MG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(prix) + ' Ar';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return this.formatDate(date);
  }
}
