import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderApiService } from '../../core/services/order-api.service';
import { AuthService } from '../../auth/services/auth.service';
import { ClientInfo, CommandeApi, CheckoutPayload } from '../../core/models/cart.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
  items = computed(() => this.cartService.items());
  sousTotal = computed(() => this.cartService.sousTotal());
  tva = computed(() => this.cartService.tva());
  total = computed(() => this.cartService.total());
  isEmpty = computed(() => this.cartService.isEmpty());

  isProcessing = signal(false);
  showSuccessModal = signal(false);
  errorMessage = signal('');
  createdOrders = signal<CommandeApi[]>([]);

  clientInfo: ClientInfo = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: 'Antananarivo',
    codePostal: '101'
  };

  selectedPaymentMethod = 'mvola';

  paymentMethods = [
    { id: 'mvola', name: 'MVola', icon: 'phone_android', description: 'Paiement mobile Orange' },
    { id: 'airtel', name: 'Airtel Money', icon: 'phone_android', description: 'Paiement mobile Airtel' },
    { id: 'card', name: 'Carte bancaire', icon: 'credit_card', description: 'Visa, Mastercard' },
    { id: 'cash', name: 'Paiement sur place', icon: 'storefront', description: 'Retrait en boutique' }
  ];

  constructor(
    private cartService: CartService,
    private orderApi: OrderApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  formatPrix(prix: number): string {
    return this.cartService.formatPrix(prix);
  }

  getItemPrice(item: any): number {
    return item.produit.prixPromo || item.produit.prix;
  }

  getItemTotal(item: any): number {
    return this.getItemPrice(item) * item.quantite;
  }

  isFormValid(): boolean {
    return !!(
      this.clientInfo.nom &&
      this.clientInfo.prenom &&
      this.clientInfo.email &&
      this.clientInfo.telephone &&
      this.clientInfo.adresse &&
      this.selectedPaymentMethod
    );
  }

  processPayment(): void {
    if (!this.isFormValid() || this.isEmpty()) return;

    // Check if user is logged in — preserve cart by passing returnUrl
    if (!this.authService.getAccessToken()) {
      this.router.navigate(['/connexion'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set('');

    const payload: CheckoutPayload = {
      methodePaiement: this.selectedPaymentMethod,
      clientNom: `${this.clientInfo.nom} ${this.clientInfo.prenom}`,
      clientEmail: this.clientInfo.email,
      clientTelephone: this.clientInfo.telephone,
      clientAdresse: `${this.clientInfo.adresse}, ${this.clientInfo.ville} ${this.clientInfo.codePostal}`
    };

    this.orderApi.checkout(payload).subscribe({
      next: (response) => {
        this.createdOrders.set(response.commandes);
        this.cartService.clearCart();
        this.isProcessing.set(false);
        this.showSuccessModal.set(true);
      },
      error: (err) => {
        this.isProcessing.set(false);
        if (err.status === 409) {
          this.errorMessage.set(err.error?.message || 'Stock insuffisant pour un ou plusieurs articles');
        } else if (err.status === 400) {
          this.errorMessage.set(err.error?.message || 'Panier vide');
        } else {
          this.errorMessage.set(err.error?.message || 'Erreur lors du paiement. Veuillez réessayer.');
        }
      }
    });
  }

  closeModal(): void {
    this.showSuccessModal.set(false);
  }

  goToInvoice(): void {
    const orders = this.createdOrders();
    if (orders.length > 0) {
      sessionStorage.setItem('currentOrder', JSON.stringify(orders));
      sessionStorage.setItem('checkoutClientInfo', JSON.stringify(this.clientInfo));
      sessionStorage.setItem('checkoutPaymentMethod', this.selectedPaymentMethod);
      this.router.navigate(['/facture']);
    }
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  getOrderNumbers(): string {
    return this.createdOrders().map(o => o.numero_commande).join(', ');
  }
}
