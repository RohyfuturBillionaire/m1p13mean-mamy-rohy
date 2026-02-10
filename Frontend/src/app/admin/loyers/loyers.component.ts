import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, Payment } from '../../core/services/payment.service';

const MONTHS_FR = ['', 'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

@Component({
  selector: 'app-loyers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loyers.component.html',
  styleUrl: './loyers.component.scss'
})
export class LoyersComponent implements OnInit {
  payments = signal<Payment[]>([]);
  loading = signal(false);

  // Filters
  selectedStatus = 'tous';
  selectedMonth: number;
  selectedYear: number;

  // Modals
  showInvoiceModal = signal(false);
  showEmailConfirmModal = signal(false);
  selectedPayment = signal<Payment | null>(null);
  emailAction = signal<'confirmation' | 'rappel' | 'facture'>('confirmation');

  constructor(private paymentService: PaymentService) {
    const now = new Date();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedYear = now.getFullYear();
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.paymentService.getPaymentsByMonth(this.selectedMonth, this.selectedYear)
      .subscribe({
        next: p => {
          if (this.selectedStatus !== 'tous') {
            this.payments.set(p.filter(pay => pay.status === this.selectedStatus));
          } else {
            this.payments.set(p);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  loadAllPayments() {
    this.loading.set(true);
    this.paymentService.getPayments().subscribe({
      next: p => {
        if (this.selectedStatus !== 'tous') {
          this.payments.set(p.filter(pay => pay.status === this.selectedStatus));
        } else {
          this.payments.set(p);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange() {
    this.loadData();
  }

  // === ACTIONS ===

  generateCurrentMonth() {
    this.paymentService.generateCurrentMonth().subscribe({
      next: result => {
        alert(`Generation terminee : ${result.created} paiement(s) cree(s), ${result.skipped} ignore(s)`);
        this.loadData();
      },
      error: err => alert(err.error?.message || 'Erreur lors de la generation')
    });
  }

  checkOverdue() {
    this.paymentService.checkOverdue().subscribe({
      next: result => {
        alert(`Verification terminee : ${result.updated} paiement(s) marque(s) en retard`);
        this.loadData();
      },
      error: err => alert(err.error?.message || 'Erreur')
    });
  }

  markAsPaid(payment: Payment) {
    if (!confirm(`Confirmer le paiement de ${this.formatMontant(payment.montant)} Ar pour ${this.getBoutiqueName(payment)} ?`)) return;
    this.paymentService.markAsPaid(payment._id).subscribe({
      next: () => {
        alert('Paiement enregistre avec succes !');
        this.loadData();
      },
      error: err => alert(err.error?.message || 'Erreur')
    });
  }

  // Invoice preview modal
  viewInvoice(payment: Payment) {
    this.selectedPayment.set(payment);
    this.showInvoiceModal.set(true);
  }

  closeInvoiceModal() {
    this.showInvoiceModal.set(false);
    this.selectedPayment.set(null);
  }

  // Download PDF
  downloadPDF(payment: Payment) {
    this.paymentService.downloadInvoicePDF(payment._id);
  }

  // Email actions
  openEmailConfirm(payment: Payment, action: 'confirmation' | 'rappel' | 'facture') {
    this.selectedPayment.set(payment);
    this.emailAction.set(action);
    this.showEmailConfirmModal.set(true);
  }

  closeEmailConfirm() {
    this.showEmailConfirmModal.set(false);
    this.selectedPayment.set(null);
  }

  sendEmail() {
    const payment = this.selectedPayment();
    if (!payment) return;

    const action = this.emailAction();
    let obs;

    if (action === 'rappel') {
      obs = this.paymentService.sendReminder(payment._id);
    } else {
      obs = this.paymentService.sendInvoiceByEmail(payment._id);
    }

    obs.subscribe({
      next: (result: any) => {
        if (result.success) {
          alert('Email envoye avec succes !');
        } else {
          alert('Erreur : ' + (result.error || 'Echec de l\'envoi'));
        }
        this.closeEmailConfirm();
        this.loadData();
      },
      error: err => {
        alert(err.error?.message || 'Erreur d\'envoi');
        this.closeEmailConfirm();
      }
    });
  }

  deletePayment(payment: Payment) {
    if (!confirm(`Supprimer le paiement ${payment.facture_numero} ?`)) return;
    this.paymentService.deletePayment(payment._id).subscribe({
      next: () => this.loadData(),
      error: err => alert(err.error?.message || 'Erreur')
    });
  }

  // === HELPERS ===

  getMonthName(mois: number): string {
    return MONTHS_FR[mois] || '';
  }

  getBoutiqueName(payment: Payment): string {
    return payment.id_boutique?.nom || '—';
  }

  getClientName(payment: Payment): string {
    return payment.id_contract?.nom_client || payment.id_contract?.id_client?.username || '—';
  }

  getClientEmail(payment: Payment): string {
    return payment.id_contract?.id_client?.email || payment.id_boutique?.email || '—';
  }

  formatMontant(montant: number): string {
    return (montant || 0).toLocaleString('fr-FR');
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'paye': 'Paye',
      'en_attente': 'En attente',
      'en_retard': 'En retard'
    };
    return labels[status] || status;
  }

  getAvailableYears(): number[] {
    const current = new Date().getFullYear();
    return [current - 1, current, current + 1];
  }

  getEmailActionLabel(): string {
    const labels: Record<string, string> = {
      'confirmation': 'Confirmation de paiement',
      'rappel': 'Rappel de retard',
      'facture': 'Facture PDF'
    };
    return labels[this.emailAction()] || '';
  }

  getStats() {
    const list = this.payments();
    return {
      total: list.length,
      totalPaye: list.filter(p => p.status === 'paye').reduce((sum, p) => sum + p.montant, 0),
      totalEnAttente: list.filter(p => p.status === 'en_attente').reduce((sum, p) => sum + p.montant, 0),
      totalEnRetard: list.filter(p => p.status === 'en_retard').reduce((sum, p) => sum + p.montant, 0),
      nbEnRetard: list.filter(p => p.status === 'en_retard').length
    };
  }
}
