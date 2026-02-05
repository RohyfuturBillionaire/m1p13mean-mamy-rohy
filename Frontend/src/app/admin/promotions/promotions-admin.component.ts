import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { DemandePromotion } from '../../core/models/admin.model';

@Component({
  selector: 'app-promotions-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promotions-admin.component.html',
  styleUrl: './promotions-admin.component.scss'
})
export class PromotionsAdminComponent implements OnInit {
  demandes = signal<DemandePromotion[]>([]);
  filterStatus = signal('all');
  selectedDemande = signal<DemandePromotion | null>(null);
  showDetailModal = signal(false);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDemandes();
  }

  private loadDemandes() {
    this.adminService.getDemandesPromotion().subscribe(d => {
      this.demandes.set(d);
    });
  }

  getFilteredDemandes() {
    if (this.filterStatus() === 'all') return this.demandes();
    return this.demandes().filter(d => d.statut === this.filterStatus());
  }

  openDetail(demande: DemandePromotion) {
    this.selectedDemande.set(demande);
    this.showDetailModal.set(true);
  }

  closeDetail() {
    this.showDetailModal.set(false);
    this.selectedDemande.set(null);
  }

  approvePromotion(demande: DemandePromotion) {
    this.adminService.updateDemandePromotion(demande.id, 'validee').subscribe(() => {
      this.loadDemandes();
      this.closeDetail();
    });
  }

  rejectPromotion(demande: DemandePromotion) {
    this.adminService.updateDemandePromotion(demande.id, 'refusee').subscribe(() => {
      this.loadDemandes();
      this.closeDetail();
    });
  }

  getStatusClass(statut: string): string {
    return `status-${statut}`;
  }

  getStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      'en_attente': 'En attente',
      'validee': 'Validée',
      'refusee': 'Refusée'
    };
    return labels[statut] || statut;
  }

  getStatusIcon(statut: string): string {
    const icons: Record<string, string> = {
      'en_attente': '⏳',
      'validee': '✅',
      'refusee': '❌'
    };
    return icons[statut] || '📋';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatMontant(montant: number): string {
    return montant.toLocaleString('fr-FR');
  }

  getStats() {
    const demandes = this.demandes();
    return {
      total: demandes.length,
      enAttente: demandes.filter(d => d.statut === 'en_attente').length,
      validees: demandes.filter(d => d.statut === 'validee').length,
      refusees: demandes.filter(d => d.statut === 'refusee').length
    };
  }
}
