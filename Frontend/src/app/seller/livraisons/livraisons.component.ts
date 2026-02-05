import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SellerService } from '../../core/services/seller.service';
import { SellerLivraison } from '../../core/models/seller.model';

@Component({
  selector: 'app-livraisons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './livraisons.component.html',
  styleUrl: './livraisons.component.scss'
})
export class LivraisonsComponent implements OnInit {
  livraisons = signal<SellerLivraison[]>([]);
  selectedLivraison = signal<SellerLivraison | null>(null);
  showDetail = signal(false);

  constructor(private sellerService: SellerService) {}

  ngOnInit() { this.loadLivraisons(); }

  loadLivraisons() {
    this.sellerService.getLivraisons().subscribe(l => this.livraisons.set(l));
  }

  openDetail(livraison: SellerLivraison) {
    this.selectedLivraison.set(livraison);
    this.showDetail.set(true);
  }

  closeDetail() {
    this.showDetail.set(false);
    this.selectedLivraison.set(null);
  }

  updateStatus(livraison: SellerLivraison, statut: SellerLivraison['statut']) {
    this.sellerService.updateLivraisonStatut(livraison.id, statut, 'Antananarivo').subscribe(() => {
      this.loadLivraisons();
      if (this.selectedLivraison()?.id === livraison.id) {
        this.sellerService.getLivraisons().subscribe(l => {
          const updated = l.find(x => x.id === livraison.id);
          if (updated) this.selectedLivraison.set(updated);
        });
      }
    });
  }

  formatDate(date: Date): string { return this.sellerService.formatDateTime(date); }

  getStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      'en_preparation': 'En préparation', 'expediee': 'Expédiée', 'en_transit': 'En transit', 'livree': 'Livrée'
    };
    return labels[statut] || statut;
  }

  getNextStatus(statut: string): SellerLivraison['statut'] | null {
    const flow: Record<string, SellerLivraison['statut']> = {
      'en_preparation': 'expediee', 'expediee': 'en_transit', 'en_transit': 'livree'
    };
    return flow[statut] || null;
  }
}
