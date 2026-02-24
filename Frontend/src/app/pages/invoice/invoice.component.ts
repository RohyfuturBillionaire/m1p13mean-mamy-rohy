import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Commande, Facture, CommandeApi, ClientInfo } from '../../core/models/cart.model';

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
    const orderData = sessionStorage.getItem('currentOrder');
    if (!orderData) {
      this.router.navigate(['/']);
      return;
    }

    try {
      const orders: CommandeApi[] = JSON.parse(orderData);
      if (!Array.isArray(orders) || orders.length === 0) {
        this.router.navigate(['/']);
        return;
      }

      // Restore client info saved at checkout
      const clientInfo: ClientInfo = JSON.parse(sessionStorage.getItem('checkoutClientInfo') || '{}');
      const paymentMethod = sessionStorage.getItem('checkoutPaymentMethod') || '';
      const firstOrder = orders[0];

      // Build CartItem-compatible items from all orders combined
      const allItems = orders.flatMap(cmd => {
        const boutiqueId = typeof cmd.id_boutique === 'object' ? cmd.id_boutique._id : (cmd.id_boutique || '');
        const boutiqueNom = typeof cmd.id_boutique === 'object' ? cmd.id_boutique.nom : '';
        return (cmd.articles || []).map(article => ({
          produit: {
            id: typeof article.id_article === 'string' ? article.id_article : (article.id_article as any)?._id || '',
            nom: article.nom,
            description: '',
            prix: article.prix,
            image: '',
            categorie: '',
            disponible: true,
            nouveau: false
          },
          boutiqueId,
          boutiqueNom,
          quantite: article.quantite
        }));
      });

      const totalTTC = orders.reduce((sum, cmd) => sum + (cmd.total || 0), 0);
      const sousTotal = totalTTC / 1.2;
      const tva = totalTTC - sousTotal;

      // client_nom is stored as "Prenom Nom" (from checkout clientNom = prenom + ' ' + nom)
      const nameParts = (firstOrder.client_nom || '').split(' ');
      const prenom = clientInfo.prenom || nameParts[0] || '';
      const nom = clientInfo.nom || nameParts.slice(1).join(' ') || '';

      const commande: Commande = {
        id: firstOrder._id,
        numeroCommande: orders.map(o => o.numero_commande).join(' / '),
        date: new Date(firstOrder.date_commande),
        client: {
          nom,
          prenom,
          email: firstOrder.client_email || clientInfo.email || '',
          telephone: firstOrder.client_telephone || clientInfo.telephone || '',
          adresse: firstOrder.client_adresse || clientInfo.adresse || '',
          ville: clientInfo.ville || 'Antananarivo',
          codePostal: clientInfo.codePostal || '101'
        },
        items: allItems,
        sousTotal,
        tva,
        total: totalTTC,
        statut: 'en_attente',
        methodePaiement: firstOrder.methode_paiement || paymentMethod
      };

      const invoice: Facture = {
        id: `f-${Date.now()}`,
        numeroFacture: `FC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        dateEmission: new Date(),
        commande,
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
    } catch {
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

  async downloadPDF(): Promise<void> {
    this.isPrinting.set(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    window.print();
    this.isPrinting.set(false);
  }
}
