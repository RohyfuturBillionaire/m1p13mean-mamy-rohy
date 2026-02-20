import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionService, PromotionApi } from '../../core/services/promotion.service';

@Component({
  selector: 'app-promotions-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promotions-admin.component.html',
  styleUrl: './promotions-admin.component.scss'
})
export class PromotionsAdminComponent implements OnInit {
  promotions = signal<PromotionApi[]>([]);
  filterStatus = signal('all');
  selectedPromo = signal<PromotionApi | null>(null);
  showDetailModal = signal(false);

  constructor(private promotionService: PromotionService) {}

  ngOnInit() {
    this.loadPromotions();
  }

  private loadPromotions() {
    this.promotionService.getAll().subscribe(p => this.promotions.set(p));
  }

  getFilteredPromotions(): PromotionApi[] {
    if (this.filterStatus() === 'all') return this.promotions();
    return this.promotions().filter(p => p.status === this.filterStatus());
  }

  openDetail(promo: PromotionApi) {
    this.selectedPromo.set(promo);
    this.showDetailModal.set(true);
  }

  closeDetail() {
    this.showDetailModal.set(false);
    this.selectedPromo.set(null);
  }

  approvePromotion(promo: PromotionApi) {
    this.promotionService.approve(promo._id).subscribe(() => {
      this.loadPromotions();
      this.closeDetail();
    });
  }

  rejectPromotion(promo: PromotionApi) {
    this.promotionService.reject(promo._id).subscribe(() => {
      this.loadPromotions();
      this.closeDetail();
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'APPROVED': 'Validee',
      'REJECTED': 'Refusee'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'PENDING': 'hourglass_empty',
      'APPROVED': 'check_circle',
      'REJECTED': 'cancel'
    };
    return icons[status] || '';
  }

  getBoutiqueName(promo: PromotionApi): string {
    if (typeof promo.id_boutique === 'object') return promo.id_boutique.nom;
    return '';
  }

  getArticleName(promo: PromotionApi): string {
    if (typeof promo.id_article === 'object') return promo.id_article.nom || promo.id_article.title || '';
    return '';
  }

  getImageUrl(promo: PromotionApi): string {
    if (!promo.image) return '';
    if (promo.image.startsWith('http')) return promo.image;
    return 'http://localhost:5000' + promo.image;
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getStats() {
    const list = this.promotions();
    return {
      total: list.length,
      enAttente: list.filter(p => p.status === 'PENDING').length,
      validees: list.filter(p => p.status === 'APPROVED').length,
      refusees: list.filter(p => p.status === 'REJECTED').length
    };
  }
}
