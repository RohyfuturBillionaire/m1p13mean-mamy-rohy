import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { BoutiqueApiService, BoutiqueApi, CategoryApi } from '../../core/services/boutique-api.service';
import { PromotionService, PromotionApi } from '../../core/services/promotion.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  sliderImages = signal<any[]>([]);
  currentSlide = signal(0);
  boutiquesVedettes = signal<BoutiqueApi[]>([]);
  promotions = signal<PromotionApi[]>([]);
  categories = signal<CategoryApi[]>([]);
  nouveautes = signal<BoutiqueApi[]>([]);

  private sliderInterval: any;

  constructor(
    private dataService: DataService,
    private boutiqueApi: BoutiqueApiService,
    private promotionService: PromotionService
  ) {}

  ngOnInit() {
    this.loadData();
    this.startSlider();
  }

  ngOnDestroy() {
    this.stopSlider();
  }

  private loadData() {
    this.dataService.getSliderImages().subscribe(images => {
      this.sliderImages.set(images);
    });

    this.boutiqueApi.getAll({ status: true }).subscribe(boutiques => {
      this.boutiquesVedettes.set(boutiques.slice(0, 6));
      // Newest boutiques by createdAt
      const sorted = [...boutiques].sort((a, b) =>
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
      this.nouveautes.set(sorted.slice(0, 4));
    });

    this.promotionService.getActive().subscribe(promos => {
      this.promotions.set(promos.slice(0, 4));
    });

    this.boutiqueApi.getCategories().subscribe(cats => {
      this.categories.set(cats);
    });
  }

  private startSlider() {
    this.sliderInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  private stopSlider() {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }

  nextSlide() {
    const total = this.sliderImages().length;
    this.currentSlide.update(current => (current + 1) % total);
  }

  prevSlide() {
    const total = this.sliderImages().length;
    this.currentSlide.update(current => (current - 1 + total) % total);
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    this.stopSlider();
    this.startSlider();
  }

  getLogoUrl(boutique: BoutiqueApi): string {
    if (!boutique.logo) return 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800';
    if (boutique.logo.startsWith('http')) return boutique.logo;
    return 'http://localhost:5000' + boutique.logo;
  }

  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-MG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(prix) + ' Ar';
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

  getImageUrl(promo: PromotionApi): string {
    if (!promo.image) return '';
    if (promo.image.startsWith('http')) return promo.image;
    return 'http://localhost:5000' + promo.image;
  }
}
