import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PromotionService, PromotionApi } from '../../core/services/promotion.service';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.scss'
})
export class PromotionsComponent implements OnInit {
  private allPromotions = signal<PromotionApi[]>([]);
  loading = signal(true);

  searchQuery = signal('');
  selectedBoutique = signal('');
  minRemise = signal(0);

  boutiques = computed(() => {
    const seen = new Set<string>();
    return this.allPromotions()
      .map(p => ({ id: this.getBoutiqueId(p), nom: this.getBoutiqueName(p) }))
      .filter(b => b.id && b.nom && !seen.has(b.id) && seen.add(b.id));
  });

  promotions = computed(() => {
    let list = this.allPromotions();
    const q = this.searchQuery().toLowerCase().trim();
    const boutique = this.selectedBoutique();
    const remise = this.minRemise();
    if (q) list = list.filter(p =>
      p.titre.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      this.getBoutiqueName(p).toLowerCase().includes(q) ||
      this.getArticleName(p).toLowerCase().includes(q)
    );
    if (boutique) list = list.filter(p => this.getBoutiqueId(p) === boutique);
    if (remise > 0) list = list.filter(p => p.remise >= remise);
    return list;
  });

  constructor(private promotionService: PromotionService) {}

  ngOnInit() {
    this.loadPromotions();
  }

  private loadPromotions() {
    this.promotionService.getActive().subscribe({
      next: promos => {
        this.allPromotions.set(promos);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedBoutique.set('');
    this.minRemise.set(0);
  }

  hasFilters(): boolean {
    return !!this.searchQuery() || !!this.selectedBoutique() || this.minRemise() > 0;
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
    if (typeof promo.id_article === 'object') return promo.id_article.nom || promo.id_article.title || '';
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
