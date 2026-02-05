import { Component, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  isSearchOpen = signal(false);
  isUserMenuOpen = signal(false);
  searchQuery = '';

  cartItemCount = computed(() => this.cartService.itemCount());

  constructor(private cartService: CartService) {}

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
    if (this.isMobileMenuOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  toggleSearch() {
    this.isSearchOpen.update(v => !v);
    this.isUserMenuOpen.set(false);
  }

  toggleUserMenu() {
    this.isUserMenuOpen.update(v => !v);
    this.isSearchOpen.set(false);
  }

  closeMenus() {
    this.isMobileMenuOpen.set(false);
    this.isSearchOpen.set(false);
    this.isUserMenuOpen.set(false);
    document.body.style.overflow = '';
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Recherche:', this.searchQuery);
      // Navigation vers la page de recherche serait implémentée ici
    }
  }

  openCart() {
    this.closeMenus();
    this.cartService.openCart();
  }
}
