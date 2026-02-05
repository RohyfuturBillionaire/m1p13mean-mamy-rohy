import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { KPI, Notification, DemandePromotion, Paiement } from '../../core/models/admin.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  kpis = signal<KPI[]>([]);
  revenueData = signal<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  loyersData = signal<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  promotionsStats = signal<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  recentNotifications = signal<Notification[]>([]);
  pendingPromotions = signal<DemandePromotion[]>([]);
  overduePayments = signal<Paiement[]>([]);

  // Chart colors
  chartColors = ['#C9A962', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63'];
  promotionColors = ['#FF9800', '#4CAF50', '#EF5350', '#9E9E9E'];
$index: any;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Load KPIs
    this.adminService.getKPIs().subscribe(kpis => this.kpis.set(kpis));

    // Load Revenue Data
    this.adminService.getRevenueData().subscribe(data => this.revenueData.set(data));

    // Load Loyers Data
    this.adminService.getLoyersData().subscribe(data => this.loyersData.set(data));

    // Load Promotions Stats
    this.adminService.getPromotionsStats().subscribe(data => this.promotionsStats.set(data));

    // Load Recent Notifications
    this.adminService.getNotifications().subscribe(notifs => {
      this.recentNotifications.set(notifs.slice(0, 5));
    });

    // Load Pending Promotions
    this.adminService.getDemandesPromotion().subscribe(promos => {
      this.pendingPromotions.set(promos.filter(p => p.statut === 'en_attente'));
    });

    // Load Overdue Payments
    this.adminService.getPaiements().subscribe(paiements => {
      this.overduePayments.set(paiements.filter(p => p.statut === 'en_retard'));
    });
  }

  getKPIIcon(icon: string): string {
    const icons: Record<string, string> = {
      'store': '🏪',
      'trending_up': '📈',
      'people': '👥',
      'visibility': '👁️'
    };
    return icons[icon] || '📊';
  }

  getMaxRevenue(): number {
    return Math.max(...this.revenueData().data);
  }

  getMaxLoyer(): number {
    return Math.max(...this.loyersData().data);
  }

  getTotalPromotions(): number {
    return this.promotionsStats().data.reduce((a, b) => a + b, 0);
  }

  getPromotionPercentage(value: number): number {
    const total = this.getTotalPromotions();
    return total > 0 ? (value / total) * 100 : 0;
  }

  getDonutOffset(index: number): number {
    const data = this.promotionsStats().data;
    let sum = 0;
    for (let i = 0; i < index; i++) {
      sum += data[i];
    }
    return 25 - this.getPromotionPercentage(sum);
  }

  formatMontant(montant: number): string {
    if (montant >= 1000000) {
      return (montant / 1000000).toFixed(1) + 'M';
    }
    if (montant >= 1000) {
      return (montant / 1000).toFixed(0) + 'k';
    }
    return montant.toString();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'paiement': '💰',
      'demande': '📋',
      'alerte': '⚠️',
      'info': 'ℹ️'
    };
    return icons[type] || '📌';
  }

  getNotificationClass(type: string): string {
    return `notif-${type}`;
  }
}
