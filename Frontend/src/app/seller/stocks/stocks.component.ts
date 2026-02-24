import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MouvementStockService } from './services/mouvement-stock.service';
import { environment } from '../../../environments/environments';

export interface StockData {
  id: string;
  nom: string;
  seuil_alerte: number;
  stock_entree: number;
  stock_sortie: number;
  stock_restant: number;
  img_url : string;
}

export interface MouvementStock {
  _id: string;
  id_article: {
    _id: string;
    nom: string;
    prix?: number;
  };
  quantity: number;
  type_mouvement: number; // 1 = entrée, 2 = sortie
  date_mouvement: string;
  seuil_alerte: number;
  createdAt: string;
}

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stocks.component.html',
  styleUrl: './stocks.component.scss'
})
export class StocksComponent implements OnInit {
  stocks = signal<StockData[]>([]);
  mouvements = signal<MouvementStock[]>([]);
  isLoading = signal(true);
  urlServer =environment.apiUrl;
  
  // Modal
  showModal = signal(false);
  selectedStock = signal<StockData | null>(null);
  isSubmitting = signal(false);
  
  // Form
  movementType = signal<1 | 2>(1); // 1 = entrée, 2 = sortie
  quantity = signal(0);
  seuilAlerte = signal(5);

  // Alerts
  alerts = computed(() => {
    const stockList = this.stocks();
    return {
      lowStock: stockList.filter(s => s.stock_restant > 0 && s.stock_restant <= s.seuil_alerte),
      outOfStock: stockList.filter(s => s.stock_restant <= 0)
    };
  });

  constructor(private mouvementService: MouvementStockService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    
    // Load current stocks
    this.mouvementService.getCurrentStocks().subscribe({
      next: (data) => {
        console.log('Stocks loaded:', data);
        this.stocks.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading stocks:', err);
        this.isLoading.set(false);
      }
    });

    // Load mouvements history
    this.mouvementService.getMouvements().subscribe({
      next: (data) => {
        console.log('Mouvements loaded:', data);
        this.mouvements.set(data);
      },
      error: (err) => {
        console.error('Error loading mouvements:', err);
      }
    });
  }

  openModal(stock: StockData) {
    this.selectedStock.set(stock);
    this.movementType.set(1);
    this.quantity.set(0);
    this.seuilAlerte.set(stock.seuil_alerte);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedStock.set(null);
  }

  submitMovement() {
    const stock = this.selectedStock();
    if (!stock || this.quantity() <= 0) return;

    this.isSubmitting.set(true);

    const mouvement = {
      id_article: stock.id,
      quantity: this.quantity(),
      type_mouvement: this.movementType(),
      seuil_alerte: this.seuilAlerte(),
      date_mouvement: new Date()
    };

    this.mouvementService.addMouvement(mouvement).subscribe({
      next: () => {
        console.log('Mouvement added');
        this.isSubmitting.set(false);
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        console.error('Error adding mouvement:', err);
        this.isSubmitting.set(false);
      }
    });
  }

  getStockClass(stock: StockData): string {
    if (stock.stock_restant <= 0) return 'out';
    if (stock.stock_restant <= stock.seuil_alerte) return 'low';
    return 'normal';
  }

  getMovementLabel(type: number): string {
    return type === 1 ? 'Entrée' : 'Sortie';
  }

  getMovementClass(type: number): string {
    return type === 1 ? 'entree' : 'sortie';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calcNewStock(): number {
    const stock = this.selectedStock();
    if (!stock) return 0;
    
    if (this.movementType() === 1) {
      return stock.stock_restant + this.quantity();
    } else {
      return Math.max(0, stock.stock_restant - this.quantity());
    }
  }

  getOutOfStockNames(): string {
    return this.alerts().outOfStock.map(s => s.nom).join(', ');
  }

  getLowStockNames(): string {
    return this.alerts().lowStock.map(s => s.nom).join(', ');
  }
}
