import { Component, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../auth/services/auth.service';

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
  isLoggedIn = computed(() => this.authService.isAuthenticated());
  userName = computed(() => this.authService.currentUser()?.username || '');

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

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
    }
  }

  openCart() {
    this.closeMenus();
    this.cartService.openCart();
  }

  logout() {
    this.authService.logout().subscribe({ error: () => {} });
    localStorage.removeItem('user');
    this.cartService.clearCart();
    this.closeMenus();
    this.router.navigate(['/']);
  }
}
