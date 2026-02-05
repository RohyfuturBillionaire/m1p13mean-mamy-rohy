import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../../core/services/seller.service';
import { SellerCommande } from '../../core/models/seller.model';

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commandes.component.html',
  styleUrl: './commandes.component.scss'
})
export class CommandesComponent implements OnInit {
  commandes = signal<SellerCommande[]>([]);
  filteredCommandes = signal<SellerCommande[]>([]);
  statusFilter = signal<string>('all');
  selectedCommande = signal<SellerCommande | null>(null);
  showDetail = signal(false);

  stats = computed(() => {
    const c = this.commandes();
    return {
      total: c.length,
      enAttente: c.filter(x => x.statut === 'en_attente').length,
      payees: c.filter(x => x.statut === 'payee').length,
      livrees: c.filter(x => x.statut === 'livree').length
    };
  });

  constructor(private sellerService: SellerService) {}

  ngOnInit() { this.loadCommandes(); }

  loadCommandes() {
    this.sellerService.getCommandes().subscribe(c => {
      this.commandes.set(c);
      this.applyFilter();
    });
  }

  applyFilter() {
    const status = this.statusFilter();
    this.filteredCommandes.set(
      status === 'all' ? this.commandes() : this.commandes().filter(c => c.statut === status)
    );
  }

  onStatusFilter(event: Event) {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
    this.applyFilter();
  }

  openDetail(commande: SellerCommande) {
    this.selectedCommande.set(commande);
    this.showDetail.set(true);
  }

  closeDetail() {
    this.showDetail.set(false);
    this.selectedCommande.set(null);
  }

  updateStatus(commande: SellerCommande, newStatus: SellerCommande['statut']) {
    this.sellerService.updateCommandeStatut(commande.id, newStatus).subscribe(() => {
      this.loadCommandes();
      if (this.selectedCommande()?.id === commande.id) {
        this.sellerService.getCommandeById(commande.id).subscribe(c => {
          if (c) this.selectedCommande.set(c);
        });
      }
    });
  }

  formatPrix(prix: number): string { return this.sellerService.formatPrix(prix); }
  formatDate(date: Date): string { return this.sellerService.formatDateTime(date); }

  getStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      'en_attente': 'En attente', 'payee': 'Payée', 'en_preparation': 'En préparation',
      'expediee': 'Expédiée', 'livree': 'Livrée', 'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  }

  getNextStatus(statut: string): SellerCommande['statut'] | null {
    const flow: Record<string, SellerCommande['statut']> = {
      'en_attente': 'payee', 'payee': 'en_preparation', 'en_preparation': 'expediee', 'expediee': 'livree'
    };
    return flow[statut] || null;
  }
}
