import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { Paiement, Facture } from '../../core/models/admin.model';

@Component({
  selector: 'app-loyers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loyers.component.html',
  styleUrl: './loyers.component.scss'
})
export class LoyersComponent implements OnInit {
  paiements = signal<Paiement[]>([]);
  factures = signal<Facture[]>([]);
  activeTab = signal<'paiements' | 'factures'>('paiements');
  filterStatus = signal('all');
  selectedFacture = signal<Facture | null>(null);
  showFactureModal = signal(false);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.adminService.getPaiements().subscribe(p => this.paiements.set(p));
    this.adminService.getFactures().subscribe(f => this.factures.set(f));
  }

  getFilteredPaiements() {
    if (this.filterStatus() === 'all') return this.paiements();
    return this.paiements().filter(p => p.statut === this.filterStatus());
  }

  getFilteredFactures() {
    if (this.filterStatus() === 'all') return this.factures();
    return this.factures().filter(f => f.statut === this.filterStatus());
  }

  markAsPaid(paiement: Paiement) {
    this.adminService.updatePaiementStatut(paiement.id, 'paye').subscribe(() => {
      this.loadData();
    });
  }

  viewFacture(facture: Facture) {
    this.selectedFacture.set(facture);
    this.showFactureModal.set(true);
  }

  closeFactureModal() {
    this.showFactureModal.set(false);
    this.selectedFacture.set(null);
  }

  downloadFacture() {
    const facture = this.selectedFacture();
    if (facture) {
      const content = this.generateFactureText(facture);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${facture.numero}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  generateFactureText(facture: Facture): string {
    return `
╔══════════════════════════════════════════════════════════════╗
║                        FACTURE                                ║
║                      TANA CENTER                              ║
╚══════════════════════════════════════════════════════════════╝

Facture N° : ${facture.numero}
Date d'émission : ${this.formatDateFull(facture.dateEmission)}
Date d'échéance : ${this.formatDateFull(facture.dateEcheance)}

────────────────────────────────────────────────────────────────
ÉMETTEUR
────────────────────────────────────────────────────────────────
TANA CENTER SARL
Avenue de l'Indépendance
Antananarivo 101, Madagascar
Email: contact@tanacenter.mg
NIF: 12345678901

────────────────────────────────────────────────────────────────
CLIENT
────────────────────────────────────────────────────────────────
${facture.clientNom}
${facture.boutiqueNom}

────────────────────────────────────────────────────────────────
DÉTAILS
────────────────────────────────────────────────────────────────
Description                              Montant (Ariary)
────────────────────────────────────────────────────────────────
Loyer mensuel                            ${this.formatMontant(facture.montant)}

────────────────────────────────────────────────────────────────
                                          SOUS-TOTAL HT : ${this.formatMontant(facture.montant)}
                                          TVA (20%)     : ${this.formatMontant(facture.tva)}
                                          ─────────────────────
                                          TOTAL TTC     : ${this.formatMontant(facture.total)}
────────────────────────────────────────────────────────────────

Statut : ${facture.statut === 'payee' ? 'PAYÉE' : facture.statut === 'en_retard' ? 'EN RETARD' : 'EN ATTENTE'}

Mode de paiement : Virement bancaire
IBAN : MG46 0001 0000 0000 1234 5678

Merci de votre confiance.
`;
  }

  getStatusClass(statut: string): string {
    return `status-${statut}`;
  }

  getStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      'paye': 'Payé',
      'payee': 'Payée',
      'en_attente': 'En attente',
      'en_retard': 'En retard'
    };
    return labels[statut] || statut;
  }

  getStatusIcon(statut: string): string {
    const icons: Record<string, string> = {
      'paye': '✅',
      'payee': '✅',
      'en_attente': '⏳',
      'en_retard': '⚠️'
    };
    return icons[statut] || '📋';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatDateFull(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatMontant(montant: number): string {
    return montant.toLocaleString('fr-FR');
  }

  getStats() {
    const paiements = this.paiements();
    const totalPaye = paiements.filter(p => p.statut === 'paye').reduce((sum, p) => sum + p.montant, 0);
    const totalEnAttente = paiements.filter(p => p.statut === 'en_attente').reduce((sum, p) => sum + p.montant, 0);
    const totalEnRetard = paiements.filter(p => p.statut === 'en_retard').reduce((sum, p) => sum + p.montant, 0);

    return {
      totalPaye,
      totalEnAttente,
      totalEnRetard,
      nbEnRetard: paiements.filter(p => p.statut === 'en_retard').length
    };
  }
}
