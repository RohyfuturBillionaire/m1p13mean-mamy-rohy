import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { ClientInfo, Commande } from '../../core/models/cart.model';

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
  currentOrder = signal<Commande | null>(null);

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

  async processPayment(): Promise<void> {
    if (!this.isFormValid() || this.isEmpty()) return;

    this.isProcessing.set(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create order
    const order = this.cartService.createOrder(this.clientInfo, this.selectedPaymentMethod);
    this.currentOrder.set(order);

    // Clear cart
    this.cartService.clearCart();

    this.isProcessing.set(false);
    this.showSuccessModal.set(true);
  }

  closeModal(): void {
    this.showSuccessModal.set(false);
  }

  goToInvoice(): void {
    const order = this.currentOrder();
    if (order) {
      // Store order in sessionStorage for invoice page
      sessionStorage.setItem('currentOrder', JSON.stringify(order));
      this.router.navigate(['/facture']);
    }
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
