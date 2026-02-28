import { Component, signal, inject, OnInit, OnDestroy, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SellerService } from '../../core/services/seller.service';
import { SellerBoutique } from '../../core/models/seller.model';
import { AuthService } from '../../auth/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';
import { MouvementStockService } from '../stocks/services/mouvement-stock.service';

@Component({
  selector: 'app-seller-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './seller-layout.component.html',
  styleUrl: './seller-layout.component.scss'
})
export class SellerLayoutComponent implements OnInit, OnDestroy {
  private sellerService = inject(SellerService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private mouvementService = inject(MouvementStockService);
  private router = inject(Router);

  sidebarCollapsed = signal(false);
  sidebarMobileOpen = signal(false);
  showNotifications = signal(false);
  showUserMenu = signal(false);
  boutique = signal<SellerBoutique | null>(null);

  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;
  unreadNotifications = computed(() => this.notificationService.notifications().filter(n => !n.lu));

  private readonly MOBILE_BREAKPOINT = 1024;
  private pollingSub?: Subscription;

  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/seller/dashboard' },
    { label: 'Produits', icon: 'inventory_2', route: '/seller/produits' },
    { label: 'Catégories', icon: 'category', route: '/seller/categories' },
    { label: 'Stocks', icon: 'warehouse', route: '/seller/stocks' },
    { label: 'Commandes', icon: 'shopping_cart', route: '/seller/commandes' },
    { label: 'Ventes', icon: 'trending_up', route: '/seller/ventes' },
    { label: 'Promotions', icon: 'local_offer', route: '/seller/promotions' },
    { label: 'Ma Boutique', icon: 'storefront', route: '/seller/profil' },
    { label: 'FAQ', icon: 'help_outline', route: '/seller/faq' },
    { label: 'Messages', icon: 'chat', route: '/seller/messages' }
  ];

  private stocksData = signal<any[]>([]);
  unreadMessages = computed(() => this.sellerService.getUnreadMessagesCount());
  stockAlerts = computed(() =>
    this.stocksData().filter(s => s.stock_restant <= 0 || s.stock_restant <= s.seuil_alerte).length
  );

  constructor() {}

  ngOnInit() {
    this.pollingSub = this.notificationService.startPolling(30000).subscribe();
    this.loadBoutique();
    this.loadStockAlerts();
    this.checkScreenSize();
  }

  ngOnDestroy() {
    this.pollingSub?.unsubscribe();
    document.body.style.overflow = '';
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    if (window.innerWidth > this.MOBILE_BREAKPOINT) {
      this.sidebarMobileOpen.set(false);
      document.body.style.overflow = '';
    }
  }

  private loadBoutique() {
    this.sellerService.getBoutique().subscribe(boutique => {
      this.boutique.set(boutique);
    });
  }

  private loadStockAlerts() {
    this.mouvementService.getCurrentStocks().subscribe({
      next: (data) => this.stocksData.set(data),
      error: () => {}
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleMobileSidebar() {
    this.sidebarMobileOpen.update(v => !v);
    document.body.style.overflow = this.sidebarMobileOpen() ? 'hidden' : '';
  }

  closeMobileSidebar() {
    this.sidebarMobileOpen.set(false);
    document.body.style.overflow = '';
  }

  onNavClick() {
    if (window.innerWidth <= this.MOBILE_BREAKPOINT) {
      this.closeMobileSidebar();
    }
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
    this.showUserMenu.set(false);
  }

  toggleUserMenu() {
    this.showUserMenu.update(v => !v);
    this.showNotifications.set(false);
  }

  closeDropdowns() {
    this.showNotifications.set(false);
    this.showUserMenu.set(false);
  }

  markAsRead(notif: Notification) {
    this.notificationService.markAsRead(notif._id).subscribe();
  }

  navigateNotif(notif: Notification) {
    this.notificationService.markAsRead(notif._id).subscribe();
    if (notif.lien) {
      this.router.navigate([notif.lien]);
      this.showNotifications.set(false);
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/connexion']),
      error: () => this.router.navigate(['/connexion'])
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'commande': return 'shopping_cart';
      case 'stock': return 'inventory';
      case 'promotion': return 'local_offer';
      case 'message': return 'chat';
      case 'paiement': return 'payments';
      case 'alerte': return 'warning';
      case 'demande': return 'assignment';
      default: return 'info';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'commande': return '#4CAF50';
      case 'stock': return '#FF9800';
      case 'promotion': return '#2196F3';
      case 'message': return '#9C27B0';
      case 'paiement': return '#4CAF50';
      case 'alerte': return '#FF9800';
      default: return '#9E9E9E';
    }
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'À l\'instant';
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Il y a ${days}j`;
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getBoutiqueInitials(): string {
    const nom = this.boutique()?.nom || 'Boutique';
    return nom.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }
}
