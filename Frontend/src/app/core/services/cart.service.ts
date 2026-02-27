import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Produit } from '../models/boutique.model';
import { CartItem, Cart } from '../models/cart.model';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'tana_center_cart';
  private readonly TVA_RATE = 0.20;
  private readonly API_URL = `${environment.apiUrl}/api/bucket`;

  private http = inject(HttpClient);
  private authService = inject(AuthService);

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

  private isLoggedIn(): boolean {
    return !!this.authService.getAccessToken();
  }

  constructor() {
    const savedCart = this.loadFromStorage();
    if (savedCart.length > 0) {
      this.cartItems.set(savedCart);
    }
    // If logged in at init, load from API
    if (this.isLoggedIn()) {
      this.loadCartFromApi();
    }
  }

  private loadFromStorage(): CartItem[] {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(this.CART_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    if (this.isLoggedIn()) {
      // When logged in, don't persist to localStorage
      localStorage.removeItem(this.CART_KEY);
    } else {
      localStorage.setItem(this.CART_KEY, JSON.stringify(this.cartItems()));
    }
  }

  getLocalItems(): CartItem[] {
    return this.loadFromStorage();
  }

  async loadCartFromApi(): Promise<void> {
    if (!this.isLoggedIn()) return;
    try {
      const response = await firstValueFrom(this.http.get<any>(this.API_URL));
      const items: CartItem[] = (response.items || [])
        .filter((item: any) => item.id_article)
        .map((item: any) => this.mapApiItemToCartItem(item));
      this.cartItems.set(items);
      localStorage.removeItem(this.CART_KEY);
    } catch {
      // Fallback: keep local state
    }
  }

  async syncOnLogin(): Promise<void> {
    const localItems = this.loadFromStorage();
    if (localItems.length > 0) {
      // Push local items to API
      for (const item of localItems) {
        try {
          await firstValueFrom(this.http.post(`${this.API_URL}/add`, {
            articleId: item.produit.id,
            boutiqueId: item.boutiqueId,
            quantite: item.quantite
          }));
        } catch {
          // Skip items that fail (e.g., out of stock)
        }
      }
      localStorage.removeItem(this.CART_KEY);
    }
    await this.loadCartFromApi();
  }

  private mapApiItemToCartItem(apiItem: any): CartItem {
    const article = apiItem.id_article;
    const boutique = apiItem.id_boutique;
    return {
      produit: {
        id: article._id,
        nom: article.nom || '',
        description: article.description || '',
        prix: apiItem.prix || article.prix,
        prixPromo: apiItem.prix_promo || undefined,
        image: article.images?.[0]
          ? `${environment.apiUrl}${article.images[0]}`
          : '',
        categorie: article.id_categorie_article?.categorie_article || '',
        disponible: (article.stock || 0) > 0,
        nouveau: false
      },
      boutiqueId: boutique?._id || '',
      boutiqueNom: boutique?.nom || '',
      quantite: apiItem.quantite
    };
  }

  addItem(produit: Produit, boutiqueId: string, boutiqueNom: string, quantite: number = 1): void {
    // Optimistic update
    const currentItems = this.cartItems();
    const existingIndex = currentItems.findIndex(
      item => item.produit.id === produit.id && item.boutiqueId === boutiqueId
    );

    if (existingIndex >= 0) {
      const updatedItems = [...currentItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantite: updatedItems[existingIndex].quantite + quantite
      };
      this.cartItems.set(updatedItems);
    } else {
      this.cartItems.set([...currentItems, { produit, boutiqueId, boutiqueNom, quantite }]);
    }
    this.saveToStorage();

    // Sync with API if logged in
    if (this.isLoggedIn()) {
      this.http.post(`${this.API_URL}/add`, {
        articleId: produit.id,
        boutiqueId,
        quantite,
        prixPromo: produit.prixPromo
      }).subscribe({
        error: () => {
          // Revert on failure
          this.cartItems.set(currentItems);
          this.saveToStorage();
        }
      });
    }
  }

  removeItem(produitId: string, boutiqueId: string): void {
    const currentItems = this.cartItems();
    const updatedItems = currentItems.filter(
      item => !(item.produit.id === produitId && item.boutiqueId === boutiqueId)
    );
    this.cartItems.set(updatedItems);
    this.saveToStorage();

    if (this.isLoggedIn()) {
      this.http.delete(`${this.API_URL}/remove/${produitId}`).subscribe({
        error: () => {
          this.cartItems.set(currentItems);
          this.saveToStorage();
        }
      });
    }
  }

  updateQuantity(produitId: string, boutiqueId: string, quantite: number): void {
    if (quantite <= 0) {
      this.removeItem(produitId, boutiqueId);
      return;
    }

    const currentItems = this.cartItems();
    const updatedItems = currentItems.map(item => {
      if (item.produit.id === produitId && item.boutiqueId === boutiqueId) {
        return { ...item, quantite };
      }
      return item;
    });
    this.cartItems.set(updatedItems);
    this.saveToStorage();

    if (this.isLoggedIn()) {
      this.http.put(`${this.API_URL}/update`, {
        articleId: produitId,
        quantite
      }).subscribe({
        error: () => {
          this.cartItems.set(currentItems);
          this.saveToStorage();
        }
      });
    }
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.saveToStorage();

    if (this.isLoggedIn()) {
      this.http.delete(`${this.API_URL}/clear`).subscribe();
    }
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
}
