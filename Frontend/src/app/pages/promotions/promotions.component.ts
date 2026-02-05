import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { Promotion } from '../../core/models/boutique.model';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.scss'
})
export class PromotionsComponent implements OnInit {
  promotions = signal<Promotion[]>([]);
  loading = signal(true);

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadPromotions();
  }

  private loadPromotions() {
    this.dataService.getPromotions().subscribe(promos => {
      this.promotions.set(promos);
      this.loading.set(false);
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getReductionText(promo: Promotion): string {
    if (promo.type === 'pourcentage') {
      return `-${promo.reduction}%`;
    } else if (promo.type === 'montant') {
      return `-${this.formatPrix(promo.reduction)}`;
    }
    return 'Offre spéciale';
  }

  formatPrix(prix: number): string {
    return this.dataService.formatPrix(prix);
  }

  isPromoActive(promo: Promotion): boolean {
    const now = new Date();
    return new Date(promo.dateDebut) <= now && new Date(promo.dateFin) >= now;
  }

  getDaysRemaining(promo: Promotion): number {
    const now = new Date();
    const end = new Date(promo.dateFin);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
