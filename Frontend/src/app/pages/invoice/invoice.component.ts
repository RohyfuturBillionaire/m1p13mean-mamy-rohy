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
      order.date = new Date(order.date);
      const invoice: Facture = {
        id: `f-${Date.now()}`,
        numeroFacture: `FC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        dateEmission: new Date(),
        commande: order,
        entreprise: {
          nom: 'Tana Center',
          adresse: 'Analakely, Antananarivo 101, Madagascar',
          telephone: '+261 20 22 123 45',
          email: 'contact@tanacenter.mg',
          nif: '1234567890',
          stat: '12345 67 890 0 00012'
        }
      };
      this.facture.set(invoice);
    } else {
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
