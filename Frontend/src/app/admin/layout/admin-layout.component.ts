import { Component, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { Notification } from '../../core/models/admin.model';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = signal(false);
  sidebarMobileOpen = signal(false);
  showNotifications = signal(false);
  showUserMenu = signal(false);
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);

  private readonly MOBILE_BREAKPOINT = 1024;

  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Clients', icon: 'people', route: '/admin/clients' },
    { label: 'Contrats', icon: 'description', route: '/admin/contrats' },
    { label: 'Types Contrat', icon: 'category', route: '/admin/types-contrat' },
    { label: 'Boutiques', icon: 'store', route: '/admin/gestion-boutiques' },
    { label: 'Promotions', icon: 'local_offer', route: '/admin/promotions' },
    { label: 'Loyers & Factures', icon: 'receipt', route: '/admin/loyers' },
    { label: 'Messages', icon: 'chat', route: '/admin/messages' },
    { label: 'Paramètres', icon: 'settings', route: '/admin/parametres' }
  ];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNotifications();
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

  private loadNotifications() {
    this.adminService.getNotifications().subscribe(notifs => {
      this.notifications.set(notifs);
      this.unreadCount.set(this.adminService.getUnreadNotificationsCount());
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

  markAsRead(notif: Notification) {
    this.adminService.markNotificationAsRead(notif.id).subscribe(() => {
      this.loadNotifications();
      if (notif.lien) {
        this.router.navigate([notif.lien]);
      }
    });
    this.showNotifications.set(false);
  }

  logout() {
    // this.adminService.logout();
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'paiement': return 'payments';
      case 'demande': return 'assignment';
      case 'alerte': return 'warning';
      default: return 'info';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'paiement': return '#4CAF50';
      case 'demande': return '#2196F3';
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
}
