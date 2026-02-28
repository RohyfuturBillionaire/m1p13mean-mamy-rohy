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

  // Confirm modal (replaces confirm())
  showConfirmModal = signal(false);
  confirmTitle = signal('');
  confirmMessage = signal('');
  private confirmCallback: (() => void) | null = null;

  // Toast (replaces alert())
  showToast = signal(false);
  toastMessage = signal('');
  toastIsError = signal(false);
  private toastTimer: any = null;

  // Action loader (prevents double-click)
  isSubmitting = signal(false);

  constructor(private paymentService: PaymentService) {
    const now = new Date();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedYear = now.getFullYear();
  }

  ngOnInit() {
    // Auto-generate all missing loyers from contract start dates, then display
    this.loading.set(true);
    this.paymentService.autoGenerateAll().subscribe({
      next: () => this.loadData(),
      error: () => this.loadData()
    });
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
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.paymentService.generateCurrentMonth().subscribe({
      next: result => {
        this.isSubmitting.set(false);
        this.showToastMsg(`Generation terminee : ${result.created} paiement(s) cree(s), ${result.skipped} ignore(s)`, false);
        this.loadData();
      },
      error: err => {
        this.isSubmitting.set(false);
        this.showToastMsg(err.error?.message || 'Erreur lors de la generation', true);
      }
    });
  }

  checkOverdue() {
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.paymentService.checkOverdue().subscribe({
      next: result => {
        this.isSubmitting.set(false);
        this.showToastMsg(`Verification terminee : ${result.updated} paiement(s) marque(s) en retard`, false);
        this.loadData();
      },
      error: err => {
        this.isSubmitting.set(false);
        this.showToastMsg(err.error?.message || 'Erreur', true);
      }
    });
  }

  markAsPaid(payment: Payment) {
    this.openConfirmModal(
      'Confirmer le paiement',
      `Confirmer le paiement de ${this.formatMontant(payment.montant)} Ar pour ${this.getBoutiqueName(payment)} ?`,
      () => {
        if (this.isSubmitting()) return;
        this.isSubmitting.set(true);
        this.paymentService.markAsPaid(payment._id).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.showToastMsg('Paiement enregistre avec succes !', false);
            this.loadData();
          },
          error: err => {
            this.isSubmitting.set(false);
            this.showToastMsg(err.error?.message || 'Erreur', true);
          }
        });
      }
    );
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
    if (!payment || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    const action = this.emailAction();
    let obs;

    if (action === 'rappel') {
      obs = this.paymentService.sendReminder(payment._id);
    } else {
      obs = this.paymentService.sendInvoiceByEmail(payment._id);
    }

    obs.subscribe({
      next: (result: any) => {
        this.isSubmitting.set(false);
        if (result.success) {
          this.showToastMsg('Email envoye avec succes !', false);
        } else {
          this.showToastMsg('Erreur : ' + (result.error || 'Echec de l\'envoi'), true);
        }
        this.closeEmailConfirm();
        this.loadData();
      },
      error: err => {
        this.isSubmitting.set(false);
        this.showToastMsg(err.error?.message || 'Erreur d\'envoi', true);
        this.closeEmailConfirm();
      }
    });
  }

  deletePayment(payment: Payment) {
    this.openConfirmModal(
      'Supprimer le paiement',
      `Supprimer le paiement ${payment.facture_numero} ? Cette action est irreversible.`,
      () => {
        this.paymentService.deletePayment(payment._id).subscribe({
          next: () => this.loadData(),
          error: err => this.showToastMsg(err.error?.message || 'Erreur', true)
        });
      }
    );
  }

  // === MODAL & TOAST HELPERS ===

  openConfirmModal(title: string, message: string, callback: () => void) {
    this.confirmTitle.set(title);
    this.confirmMessage.set(message);
    this.confirmCallback = callback;
    this.showConfirmModal.set(true);
  }

  closeConfirmModal() {
    this.showConfirmModal.set(false);
    this.confirmCallback = null;
  }

  doConfirm() {
    const cb = this.confirmCallback;
    this.closeConfirmModal();
    if (cb) cb();
  }

  showToastMsg(msg: string, isError: boolean) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage.set(msg);
    this.toastIsError.set(isError);
    this.showToast.set(true);
    this.toastTimer = setTimeout(() => this.showToast.set(false), 4000);
  }

  closeToast() {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.showToast.set(false);
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
