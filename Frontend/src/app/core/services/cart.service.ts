import { Injectable, signal, computed } from '@angular/core';
import { Produit } from '../models/boutique.model';
import { CartItem, Cart, ClientInfo, Commande, Facture } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'tana_center_cart';
  private readonly TVA_RATE = 0.20; // 20% TVA

  private cartItems = signal<CartItem[]>(this.loadFromStorage());

  isCartOpen = signal(false);

  // Computed values
  items = computed(() => this.cartItems());

  itemCount = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.quantite, 0);
  });

  sousTotal = computed(() => {
    return this.cartItems().reduce((total, item) => {
      const prix = item.produit.prixPromo || item.produit.prix;
      return total + (prix * item.quantite);
    }, 0);
  });

  tva = computed(() => {
    return this.sousTotal() * this.TVA_RATE;
  });

  total = computed(() => {
    return this.sousTotal() + this.tva();
  });

  cart = computed<Cart>(() => ({
    items: this.cartItems(),
    sousTotal: this.sousTotal(),
    tva: this.tva(),
    total: this.total()
  }));

  isEmpty = computed(() => this.cartItems().length === 0);

  constructor() {
    // Load cart from storage on initialization
    const savedCart = this.loadFromStorage();
    if (savedCart.length > 0) {
      this.cartItems.set(savedCart);
    }
  }

  private loadFromStorage(): CartItem[] {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(this.CART_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.CART_KEY, JSON.stringify(this.cartItems()));
  }

  addItem(produit: Produit, boutiqueId: string, boutiqueNom: string, quantite: number = 1): void {
    const currentItems = this.cartItems();
    const existingIndex = currentItems.findIndex(
      item => item.produit.id === produit.id && item.boutiqueId === boutiqueId
    );

    if (existingIndex >= 0) {
      // Update quantity
      const updatedItems = [...currentItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantite: updatedItems[existingIndex].quantite + quantite
      };
      this.cartItems.set(updatedItems);
    } else {
      // Add new item
      this.cartItems.set([...currentItems, {
        produit,
        boutiqueId,
        boutiqueNom,
        quantite
      }]);
    }
    this.saveToStorage();
  }

  removeItem(produitId: string, boutiqueId: string): void {
    const updatedItems = this.cartItems().filter(
      item => !(item.produit.id === produitId && item.boutiqueId === boutiqueId)
    );
    this.cartItems.set(updatedItems);
    this.saveToStorage();
  }

  updateQuantity(produitId: string, boutiqueId: string, quantite: number): void {
    if (quantite <= 0) {
      this.removeItem(produitId, boutiqueId);
      return;
    }

    const updatedItems = this.cartItems().map(item => {
      if (item.produit.id === produitId && item.boutiqueId === boutiqueId) {
        return { ...item, quantite };
      }
      return item;
    });
    this.cartItems.set(updatedItems);
    this.saveToStorage();
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.saveToStorage();
  }

  openCart(): void {
    this.isCartOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeCart(): void {
    this.isCartOpen.set(false);
    document.body.style.overflow = '';
  }

  toggleCart(): void {
    if (this.isCartOpen()) {
      this.closeCart();
    } else {
      this.openCart();
    }
  }

  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-MG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(prix) + ' Ar';
  }

  // Generate unique order number
  generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TC${year}${month}${day}-${random}`;
  }

  // Generate unique invoice number
  generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `FAC-${year}${month}-${random}`;
  }

  // Create order from cart
  createOrder(client: ClientInfo, methodePaiement: string): Commande {
    const commande: Commande = {
      id: crypto.randomUUID(),
      numeroCommande: this.generateOrderNumber(),
      date: new Date(),
      client,
      items: [...this.cartItems()],
      sousTotal: this.sousTotal(),
      tva: this.tva(),
      total: this.total(),
      statut: 'payee',
      methodePaiement
    };
    return commande;
  }

  // Create invoice from order
  createInvoice(commande: Commande): Facture {
    const facture: Facture = {
      id: crypto.randomUUID(),
      numeroFacture: this.generateInvoiceNumber(),
      dateEmission: new Date(),
      commande,
      entreprise: {
        nom: 'Tana Center',
        adresse: 'Lot IVG 123, Analakely, Antananarivo 101',
        telephone: '+261 34 00 000 00',
        email: 'contact@tanacenter.mg',
        nif: '1234567890',
        stat: '12345-67-2024-0-00001'
      }
    };
    return facture;
  }
}
