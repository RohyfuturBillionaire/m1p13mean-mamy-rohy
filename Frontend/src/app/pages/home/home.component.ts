import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { Boutique, Promotion, Categorie } from '../../core/models/boutique.model';

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
  boutiquesVedettes = signal<Boutique[]>([]);
  promotions = signal<Promotion[]>([]);
  categories = signal<Categorie[]>([]);
  nouveautes = signal<Boutique[]>([]);

  private sliderInterval: any;

  constructor(private dataService: DataService) {}

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

    this.dataService.getBoutiquesVedettes().subscribe(boutiques => {
      this.boutiquesVedettes.set(boutiques);
    });

    this.dataService.getPromotionsActives().subscribe(promos => {
      this.promotions.set(promos.slice(0, 4));
    });

    this.dataService.getCategories().subscribe(cats => {
      this.categories.set(cats);
    });

    this.dataService.getNouvellesBoutiques().subscribe(boutiques => {
      this.nouveautes.set(boutiques);
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

  formatPrix(prix: number): string {
    return this.dataService.formatPrix(prix);
  }

  getReductionText(promo: Promotion): string {
    if (promo.type === 'pourcentage') {
      return `-${promo.reduction}%`;
    } else if (promo.type === 'montant') {
      return `-${this.formatPrix(promo.reduction)}`;
    }
    return 'Offre spéciale';
  }
}
