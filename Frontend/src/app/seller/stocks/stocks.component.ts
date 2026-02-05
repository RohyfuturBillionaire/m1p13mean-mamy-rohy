import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../../core/services/seller.service';
import { SellerProduit, StockMovement } from '../../core/models/seller.model';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stocks.component.html',
  styleUrl: './stocks.component.scss'
})
export class StocksComponent implements OnInit {
  produits = signal<SellerProduit[]>([]);
  mouvements = signal<StockMovement[]>([]);
  showModal = signal(false);
  selectedProduit = signal<SellerProduit | null>(null);
  isSubmitting = signal(false);

  movementType = signal<'entree' | 'sortie' | 'ajustement'>('entree');
  quantity = signal(0);
  motif = signal('');

  alerts = computed(() => {
    const prods = this.produits();
    return {
      lowStock: prods.filter(p => p.stock > 0 && p.stock <= p.stockAlerte),
      outOfStock: prods.filter(p => p.stock === 0)
    };
  });

  constructor(private sellerService: SellerService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.sellerService.getProduits().subscribe(p => this.produits.set(p));
    this.sellerService.getStockMovements().subscribe(m => this.mouvements.set(m));
  }

  openModal(produit: SellerProduit) {
    this.selectedProduit.set(produit);
    this.movementType.set('entree');
    this.quantity.set(0);
    this.motif.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedProduit.set(null);
  }

  submitMovement() {
    const produit = this.selectedProduit();
    if (!produit || this.quantity() <= 0) return;

    this.isSubmitting.set(true);
    const type = this.movementType();
    let newStock = produit.stock;

    if (type === 'entree') newStock += this.quantity();
    else if (type === 'sortie') newStock = Math.max(0, newStock - this.quantity());
    else newStock = this.quantity();

    this.sellerService.addStockMovement({
      produitId: produit.id,
      produitNom: produit.nom,
      type,
      quantite: this.quantity(),
      stockAvant: produit.stock,
      stockApres: newStock,
      motif: this.motif() || ''
    }).subscribe(() => {
      this.isSubmitting.set(false);
      this.closeModal();
      this.loadData();
    });
  }

  formatPrix(prix: number): string {
    return this.sellerService.formatPrix(prix);
  }

  formatDate(date: Date): string {
    return this.sellerService.formatDateTime(date);
  }

  getMovementLabel(type: string): string {
    const labels: Record<string, string> = { 'entree': 'Entrée', 'sortie': 'Sortie', 'ajustement': 'Ajustement' };
    return labels[type] || type;
  }

  getStockClass(produit: SellerProduit): string {
    if (produit.stock === 0) return 'out';
    if (produit.stock <= produit.stockAlerte) return 'low';
    return 'normal';
  }

  getOutOfStockNames(): string {
    return this.alerts().outOfStock.map(p => p.nom).join(', ');
  }

  getLowStockNames(): string {
    return this.alerts().lowStock.map(p => p.nom).join(', ');
  }

  calcNewStock(type: string, currentStock: number, qty: number): number {
    if (type === 'entree') return currentStock + qty;
    return Math.max(0, currentStock - qty);
  }
}
