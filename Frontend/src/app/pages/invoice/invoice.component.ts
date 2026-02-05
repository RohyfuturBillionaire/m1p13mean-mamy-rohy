import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Commande, Facture } from '../../core/models/cart.model';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent implements OnInit {
  facture = signal<Facture | null>(null);
  isPrinting = signal(false);

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load order from sessionStorage
    const orderData = sessionStorage.getItem('currentOrder');
    if (orderData) {
      const order: Commande = JSON.parse(orderData);
      // Convert date string back to Date object
      order.date = new Date(order.date);
      const invoice = this.cartService.createInvoice(order);
      this.facture.set(invoice);
    } else {
      // No order found, redirect to home
      this.router.navigate(['/']);
    }
  }

  formatPrix(prix: number): string {
    return this.cartService.formatPrix(prix);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getItemPrice(item: any): number {
    return item.produit.prixPromo || item.produit.prix;
  }

  getItemTotal(item: any): number {
    return this.getItemPrice(item) * item.quantite;
  }

  printInvoice(): void {
    window.print();
  }

  async downloadPDF(): Promise<void> {
    this.isPrinting.set(true);

    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, you'd use a library like jsPDF or call a backend API
    // For this mock, we'll just trigger print
    window.print();

    this.isPrinting.set(false);
  }
}
