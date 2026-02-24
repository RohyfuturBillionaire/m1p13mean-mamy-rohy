import { Component, signal, OnInit, OnDestroy, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SellerService } from '../../core/services/seller.service';
import { SellerNotification, SellerBoutique } from '../../core/models/seller.model';

@Component({
  selector: 'app-seller-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './seller-layout.component.html',
  styleUrl: './seller-layout.component.scss'
})
export class SellerLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = signal(false);
  sidebarMobileOpen = signal(false);
  showNotifications = signal(false);
  showUserMenu = signal(false);
  notifications = signal<SellerNotification[]>([]);
  boutique = signal<SellerBoutique | null>(null);

  private readonly MOBILE_BREAKPOINT = 1024;

  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/seller/dashboard' },
    { label: 'Produits', icon: 'inventory_2', route: '/seller/produits' },
    { label: 'Catégories', icon: 'category', route: '/seller/categories' },
    { label: 'Stocks', icon: 'warehouse', route: '/seller/stocks' },
    { label: 'Commandes', icon: 'shopping_cart', route: '/seller/commandes' },
{ label: 'Promotions', icon: 'local_offer', route: '/seller/promotions' },
    { label: 'Ma Boutique', icon: 'storefront', route: '/seller/profil' },
    { label: 'FAQ', icon: 'help_outline', route: '/seller/faq' },
    { label: 'Messages', icon: 'chat', route: '/seller/messages' }
  ];

  unreadCount = computed(() => {
    return this.notifications().filter(n => !n.lu).length;
  });

  unreadMessages = computed(() => {
    return this.sellerService.getUnreadMessagesCount();
  });

  stockAlerts = computed(() => {
    return this.sellerService.getStockAlertsArray().length;
  });

  constructor(
    private sellerService: SellerService,
    private router: Router
  ) {}

  ngOnInit() {
    // if (!this.sellerService.isLoggedIn()) {
    //   this.router.navigate(['/connexion']);
    //   return;
    // }
    this.loadData();
    this.checkScreenSize();
  }

  ngOnDestroy() {
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

  private loadData() {
    this.sellerService.getNotifications().subscribe(notifs => {
      this.notifications.set(notifs);
    });

    this.sellerService.getBoutique().subscribe(boutique => {
      this.boutique.set(boutique);
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleMobileSidebar() {
    this.sidebarMobileOpen.update(v => !v);
    if (this.sidebarMobileOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
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

  markAsRead(notif: SellerNotification) {
    this.sellerService.markNotificationAsRead(notif.id).subscribe(() => {
      this.loadData();
      if (notif.lien) {
        this.router.navigate([notif.lien]);
      }
    });
    this.showNotifications.set(false);
  }

  logout() {
    this.sellerService.logout();
    this.router.navigate(['/connexion']);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'commande': return 'shopping_cart';
      case 'stock': return 'inventory';
      case 'promotion': return 'local_offer';
      case 'message': return 'chat';
      default: return 'info';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'commande': return '#4CAF50';
      case 'stock': return '#FF9800';
      case 'promotion': return '#2196F3';
      case 'message': return '#9C27B0';
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
