import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PromotionService, PromotionApi } from '../../core/services/promotion.service';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.scss'
})
export class PromotionsComponent implements OnInit {
  promotions = signal<PromotionApi[]>([]);
  loading = signal(true);

  constructor(private promotionService: PromotionService) {}

  ngOnInit() {
    this.loadPromotions();
  }

  private loadPromotions() {
    this.promotionService.getActive().subscribe({
      next: promos => {
        this.promotions.set(promos);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getReductionText(promo: PromotionApi): string {
    return `-${promo.remise}%`;
  }

  getBoutiqueName(promo: PromotionApi): string {
    if (typeof promo.id_boutique === 'object') return promo.id_boutique.nom;
    return '';
  }

  getBoutiqueLogo(promo: PromotionApi): string {
    if (typeof promo.id_boutique === 'object' && promo.id_boutique.logo) {
      const logo = promo.id_boutique.logo;
      if (logo.startsWith('http')) return logo;
      return 'http://localhost:5000' + logo;
    }
    return '';
  }

  getBoutiqueId(promo: PromotionApi): string {
    if (typeof promo.id_boutique === 'object') return promo.id_boutique._id;
    return promo.id_boutique;
  }

  getArticleName(promo: PromotionApi): string {
    if (typeof promo.id_article === 'object') return promo.id_article.title;
    return '';
  }

  getImageUrl(promo: PromotionApi): string {
    if (!promo.image) return '';
    if (promo.image.startsWith('http')) return promo.image;
    return 'http://localhost:5000' + promo.image;
  }

  isPromoActive(promo: PromotionApi): boolean {
    const now = new Date();
    return new Date(promo.date_debut) <= now && new Date(promo.date_fin) >= now;
  }

  getDaysRemaining(promo: PromotionApi): number {
    const now = new Date();
    const end = new Date(promo.date_fin);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
