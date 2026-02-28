import { Component, signal, computed, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  sidebarCollapsed = signal(false);
  sidebarMobileOpen = signal(false);
  showNotifications = signal(false);
  showUserMenu = signal(false);

  currentUserName = computed(() => this.authService.currentUser()?.username || 'Admin');
  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;
  unreadNotifications = computed(() => this.notificationService.notifications().filter(n => !n.lu));

  private readonly MOBILE_BREAKPOINT = 1024;
  private pollingSub?: Subscription;

  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Clients', icon: 'people', route: '/admin/clients' },
    { label: 'Contrats', icon: 'description', route: '/admin/contrats' },
    { label: 'Types Contrat', icon: 'category', route: '/admin/types-contrat' },
    { label: 'Boutiques', icon: 'store', route: '/admin/gestion-boutiques' },
    { label: 'Plan Centre', icon: 'map', route: '/admin/plan-centre' },
    { label: 'Promotions', icon: 'local_offer', route: '/admin/promotions' },
    { label: 'Loyers & Factures', icon: 'receipt', route: '/admin/loyers' },
    { label: 'Associations', icon: 'link', route: '/admin/association-boutiques' },
    { label: 'Messages', icon: 'chat', route: '/admin/messages' }
  ];

  constructor() {}

  ngOnInit() {
    this.pollingSub = this.notificationService.startPolling(30000).subscribe();
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
      case 'paiement': return 'payments';
      case 'demande': return 'assignment';
      case 'alerte': return 'warning';
      case 'commande': return 'shopping_cart';
      case 'stock': return 'inventory';
      case 'promotion': return 'local_offer';
      case 'message': return 'chat';
      default: return 'info';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'paiement': return '#4CAF50';
      case 'demande': return '#2196F3';
      case 'alerte': return '#FF9800';
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
}
