import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.scss'
})
export class CartDrawerComponent {
  isOpen = computed(() => this.cartService.isCartOpen());
  items = computed(() => this.cartService.items());
  itemCount = computed(() => this.cartService.itemCount());
  sousTotal = computed(() => this.cartService.sousTotal());
  tva = computed(() => this.cartService.tva());
  total = computed(() => this.cartService.total());
  isEmpty = computed(() => this.cartService.isEmpty());

  constructor(public cartService: CartService) {}

  close(): void {
    this.cartService.closeCart();
  }

  removeItem(produitId: string, boutiqueId: string): void {
    this.cartService.removeItem(produitId, boutiqueId);
  }

  updateQuantity(produitId: string, boutiqueId: string, quantite: number): void {
    this.cartService.updateQuantity(produitId, boutiqueId, quantite);
  }

  increment(produitId: string, boutiqueId: string, currentQuantite: number): void {
    this.updateQuantity(produitId, boutiqueId, currentQuantite + 1);
  }

  decrement(produitId: string, boutiqueId: string, currentQuantite: number): void {
    this.updateQuantity(produitId, boutiqueId, currentQuantite - 1);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  formatPrix(prix: number): string {
    return this.cartService.formatPrix(prix);
  }

  getItemPrice(item: any): number {
    return item.produit.prixPromo || item.produit.prix;
  }

  getItemTotal(item: any): number {
    return this.getItemPrice(item) * item.quantite;
  }
}
