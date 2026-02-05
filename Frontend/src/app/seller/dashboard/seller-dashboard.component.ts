import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SellerService } from '../../core/services/seller.service';
import {
  SellerKPI,
  SellerChartData,
  SellerNotification,
  SellerCommande,
  SellerProduit
} from '../../core/models/seller.model';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './seller-dashboard.component.html',
  styleUrl: './seller-dashboard.component.scss'
})
export class SellerDashboardComponent implements OnInit {
  kpis = signal<SellerKPI[]>([]);
  ventesMensuelles = signal<SellerChartData>({ labels: [], datasets: [] });
  bestSellers = signal<SellerChartData>({ labels: [], datasets: [] });
  stockStatus = signal<SellerChartData>({ labels: [], datasets: [] });
  recentNotifications = signal<SellerNotification[]>([]);
  pendingOrders = signal<SellerCommande[]>([]);
  stockAlerts = signal<{ lowStock: SellerProduit[], outOfStock: SellerProduit[] }>({ lowStock: [], outOfStock: [] });

  chartColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  stockColors = ['#10B981', '#F59E0B', '#EF4444'];

  constructor(private sellerService: SellerService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.sellerService.getKPIs().subscribe(kpis => this.kpis.set(kpis));
    this.sellerService.getVentesMensuelles().subscribe(data => this.ventesMensuelles.set(data));
    this.sellerService.getBestSellers().subscribe(data => this.bestSellers.set(data));
    this.sellerService.getStockStatus().subscribe(data => this.stockStatus.set(data));

    this.sellerService.getNotifications().subscribe(notifs => {
      this.recentNotifications.set(notifs.slice(0, 5));
    });

    this.sellerService.getCommandes().subscribe(commandes => {
      this.pendingOrders.set(
        commandes.filter(c => c.statut === 'en_attente' || c.statut === 'payee').slice(0, 5)
      );
    });

    this.sellerService.getStockAlerts().subscribe(alerts => {
      this.stockAlerts.set(alerts);
    });
  }

  getKPIIcon(icon: string): string {
    const icons: Record<string, string> = {
      'shopping_cart': 'shopping_cart',
      'payments': 'payments',
      'inventory': 'inventory_2',
      'star': 'star',
      'trending_up': 'trending_up',
      'people': 'people'
    };
    return icons[icon] || 'analytics';
  }

  getChartData(chart: SellerChartData): number[] {
    return chart.datasets[0]?.data || [];
  }

  getMaxVentes(): number {
    const data = this.getChartData(this.ventesMensuelles());
    const max = data.length > 0 ? Math.max(...data) : 0;
    return max > 0 ? max : 1;
  }

  getMaxBestSeller(): number {
    const data = this.getChartData(this.bestSellers());
    const max = data.length > 0 ? Math.max(...data) : 0;
    return max > 0 ? max : 1;
  }

  getTotalStock(): number {
    const data = this.getChartData(this.stockStatus());
    return data.reduce((a, b) => a + b, 0);
  }

  getStockPercentage(value: number): number {
    const total = this.getTotalStock();
    return total > 0 ? (value / total) * 100 : 0;
  }

  getDonutOffset(index: number): number {
    const data = this.getChartData(this.stockStatus());
    let sum = 0;
    for (let i = 0; i < index; i++) {
      sum += data[i];
    }
    return 25 - this.getStockPercentage(sum);
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

  formatPrix(prix: number): string {
    return this.sellerService.formatPrix(prix);
  }

  formatDate(date: Date): string {
    return this.sellerService.getRelativeTime(date);
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'commande': 'shopping_cart',
      'stock': 'inventory_2',
      'promotion': 'local_offer',
      'message': 'chat'
    };
    return icons[type] || 'notifications';
  }

  getNotificationColor(type: string): string {
    const colors: Record<string, string> = {
      'commande': '#10B981',
      'stock': '#F59E0B',
      'promotion': '#6366F1',
      'message': '#8B5CF6'
    };
    return colors[type] || '#6B7280';
  }

  getOrderStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      'en_attente': 'En attente',
      'payee': 'Payée',
      'en_preparation': 'En préparation',
      'expediee': 'Expédiée',
      'livree': 'Livrée',
      'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  }

  getOrderStatusClass(statut: string): string {
    const classes: Record<string, string> = {
      'en_attente': 'pending',
      'payee': 'paid',
      'en_preparation': 'preparing',
      'expediee': 'shipped',
      'livree': 'delivered',
      'annulee': 'cancelled'
    };
    return classes[statut] || '';
  }
}
