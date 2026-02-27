import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderApiService } from '../../core/services/order-api.service';
import { BoutiqueStats, CommandeApi } from '../../core/models/cart.model';

@Component({
  selector: 'app-ventes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ventes.component.html',
  styleUrl: './ventes.component.scss'
})
export class VentesComponent implements OnInit {
  private orderApi = inject(OrderApiService);

  stats = signal<BoutiqueStats | null>(null);
  commandes = signal<CommandeApi[]>([]);
  loading = signal(true);
  statusFilter = signal('all');

  readonly chartColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  readonly MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  monthlyData = computed(() => {
    const s = this.stats();
    if (!s) return [];
    return [...s.monthly].sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.month - b.month
    );
  });

  maxRevenu = computed(() => {
    const data = this.monthlyData().map(m => m.revenu);
    return data.length ? Math.max(...data) : 1;
  });

  topBestSellers = computed(() => (this.stats()?.bestSellers ?? []).slice(0, 6));

  maxVendu = computed(() => {
    const top = this.topBestSellers();
    return top.length ? Math.max(...top.map(b => b.totalVendu)) : 1;
  });

  filteredCommandes = computed(() => {
    const all = this.commandes();
    const f = this.statusFilter();
    return f === 'all' ? all : all.filter(c => c.status === f);
  });

  totalRevenu = computed(() => this.stats()?.totalRevenu ?? 0);
  nbCommandes = computed(() => this.stats()?.nbCommandes ?? 0);
  panierMoyen = computed(() => {
    const s = this.stats();
    return s && s.nbCommandes > 0 ? Math.round(s.totalRevenu / s.nbCommandes) : 0;
  });
  totalArticlesVendus = computed(() => this.stats()?.totalArticlesVendus ?? 0);

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loading.set(true);
    this.orderApi.getBoutiqueStats().subscribe({
      next: stats => { this.stats.set(stats); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.orderApi.getBoutiqueOrders({ limit: 100 }).subscribe({
      next: res => this.commandes.set(res.data),
      error: () => {}
    });
  }

  onStatusFilter(event: Event) {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
  }

  formatPrix(n: number): string {
    return new Intl.NumberFormat('fr-MG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' Ar';
  }

  formatMontant(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k';
    return n.toString();
  }

  getMonthLabel(m: { year: number; month: number }): string {
    return this.MONTH_NAMES[m.month - 1] || '';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getArticlesPreview(articles: { nom: string }[]): string {
    const preview = articles.slice(0, 2).map(a => a.nom).join(', ');
    return articles.length > 2 ? preview + '...' : preview;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente', 'VALIDEE': 'Validée',
      'EN_PREPARATION': 'En préparation', 'EXPEDIEE': 'Expédiée',
      'LIVREE': 'Livrée', 'ANNULEE': 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'EN_ATTENTE': 'pending', 'VALIDEE': 'paid',
      'EN_PREPARATION': 'preparing', 'EXPEDIEE': 'shipped',
      'LIVREE': 'delivered', 'ANNULEE': 'cancelled'
    };
    return classes[status] || '';
  }
}
