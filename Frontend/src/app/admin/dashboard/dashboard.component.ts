import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { KPI, DemandePromotion, Paiement } from '../../core/models/admin.model';
import { DashboardService, DashboardData } from './services/dashbaord.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent implements OnInit {
  dashboardData: DashboardData | null = null;

  chartColors = ['#6366F1', '#10B981', '#F59E42', '#EF4444', '#F472B6', '#3B82F6', '#FBBF24', '#34D399'];
  promotionColors = ['#6366F1', '#10B981', '#F59E42'];

  constructor(private adminService: AdminService, private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getDashboardData().subscribe(data => {
      this.dashboardData = data;
    });
  }

  // private loadDashboardData() {
  //   // Load Dashboard Data
  //   this.dashboardService.getDashboardData().subscribe(data => {
  //     this.dashboardData = data;
  //   });
    
  //   // Load KPIs
  //   this.adminService.getKPIs().subscribe(kpis => this.kpis.set(kpis));
    
  //   // Load Revenue Data
  //   this.adminService.getRevenueData().subscribe(data => this.revenueData.set(data));
    
  //   // Load Loyers Data
  //   this.adminService.getLoyersData().subscribe(data => this.loyersData.set(data));
    
  //   // Load Promotions Stats
  //   this.adminService.getPromotionsStats().subscribe(data => this.promotionsStats.set(data));
    
  //   // Load Recent Notifications
  //   this.adminService.getNotifications().subscribe(notifs => {
  //     this.recentNotifications.set(notifs.slice(0, 5));
  //   });

  //   // Load Pending Promotions
  //   this.adminService.getDemandesPromotion().subscribe(promos => {
  //     this.pendingPromotions.set(promos.filter(p => p.statut === 'en_attente'));
  //   });

  //   // Load Overdue Payments
  //   this.adminService.getPaiements().subscribe(paiements => {
  //     this.overduePayments.set(paiements.filter(p => p.statut === 'en_retard'));
  //   });
  // }

  // KPI Cards
  kpis() {
    if (!this.dashboardData) return [];
    return [
      { label: 'Boutiques', value: this.dashboardData.totalBoutiques, icon: 'store', color: '#6366F1' },
      { label: 'Clients', value: this.dashboardData.totalClients, icon: 'people', color: '#10B981' },
      { label: 'Revenus', value: this.formatMontant(this.dashboardData.revenuePayementLoyer) + ' Ar', icon: 'attach_money', color: '#F59E42' },
      { label: 'Promos en attente', value: this.dashboardData.promo_en_attente, icon: 'hourglass_empty', color: '#EF4444' }
    ];
  }

  // Revenue Chart
  revenueData() {
    if (!this.dashboardData) return { labels: [], data: [] };
    const sorted = [...this.dashboardData.revenue_par_mois].sort((a, b) => {
      if (a._id.year !== b._id.year) return a._id.year - b._id.year;
      return a._id.month - b._id.month;
    });
    return {
      labels: sorted.map(item => this.getMonthLabel(item._id.month)),
      data: sorted.map(item => item.totalAmount)
    };
  }
  getMaxRevenue() {
    return Math.max(...(this.revenueData().data.length ? this.revenueData().data : [1]));
  }

  // Loyers par Boutique
  loyersData() {
    if (!this.dashboardData) return { labels: [], data: [] };
    return {
      labels: this.dashboardData.boutiques.map(b => b.nom),
      data: this.dashboardData.boutiques.map(b => b.loyer || 0)
    };
  }
  getMaxLoyer() {
    return Math.max(...(this.loyersData().data.length ? this.loyersData().data : [1]));
  }

  // Promotions Stats
  promotionsStats() {
    if (!this.dashboardData) return { labels: [], data: [] };
    return {
      labels: ['En attente', 'Approuvées', 'Rejetées'],
      data: [
        this.dashboardData.promo_en_attente,
        this.dashboardData.promo_approuve,
        this.dashboardData.promo_rejete
      ]
    };
  }
  getPromotionPercentage(value: number) {
    const total = this.getTotalPromotions();
    return total ? Math.round((value / total) * 100) : 0;
  }
  getTotalPromotions() {
    if (!this.dashboardData) return 0;
    return this.dashboardData.promo_en_attente + this.dashboardData.promo_approuve + this.dashboardData.promo_rejete;
  }
  getDonutOffset(i: number) {
    const stats = this.promotionsStats().data;
    let offset = 25;
    for (let j = 0; j < i; j++) {
      offset -= this.getPromotionPercentage(stats[j]);
    }
    return offset;
  }

  // Formatting helpers
  formatMontant(val: number) {
    return val?.toLocaleString('fr-FR');
  }
  getMonthLabel(month: number) {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months[month - 1] || '';
  }

  // Dummy implementations for notifications and alerts (replace with real data)
  recentNotifications() { return []; }
  overduePayments() { return []; }
  pendingPromotions() { return []; }
  getKPIIcon(icon: string) { return icon; }
  getNotificationClass(type: string) { return ''; }
  getNotificationIcon(type: string) { return ''; }
  formatDate(date: string) { return date; }
}
