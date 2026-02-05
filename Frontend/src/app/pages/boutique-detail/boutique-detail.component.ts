import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { CartService } from '../../core/services/cart.service';
import { Boutique, Produit, Promotion } from '../../core/models/boutique.model';

@Component({
  selector: 'app-boutique-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './boutique-detail.component.html',
  styleUrl: './boutique-detail.component.scss'
})
export class BoutiqueDetailComponent implements OnInit {
  boutique = signal<Boutique | null>(null);
  promotions = signal<Promotion[]>([]);
  loading = signal(true);
  selectedCategorie = signal<string>('all');
  activeTab = signal<'produits' | 'infos'>('produits');
  addedToCart = signal<string | null>(null);

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadBoutique(id);
      }
    });
  }

  private loadBoutique(id: string) {
    this.loading.set(true);
    this.dataService.getBoutiqueById(id).subscribe(boutique => {
      this.boutique.set(boutique || null);
      this.loading.set(false);
    });

    this.dataService.getPromotionsByBoutique(id).subscribe(promos => {
      this.promotions.set(promos);
    });
  }

  get produitCategories(): string[] {
    const boutique = this.boutique();
    if (!boutique) return [];
    const categories = new Set(boutique.produits.map(p => p.categorie));
    return ['all', ...Array.from(categories)];
  }

  get filteredProduits(): Produit[] {
    const boutique = this.boutique();
    if (!boutique) return [];

    if (this.selectedCategorie() === 'all') {
      return boutique.produits;
    }

    return boutique.produits.filter(p => p.categorie === this.selectedCategorie());
  }

  setCategorie(categorie: string) {
    this.selectedCategorie.set(categorie);
  }

  setTab(tab: 'produits' | 'infos') {
    this.activeTab.set(tab);
  }

  formatPrix(prix: number): string {
    return this.dataService.formatPrix(prix);
  }

  getJourActuel(): string {
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    return jours[new Date().getDay()];
  }

  getHorairesAujourdhui(): string {
    const boutique = this.boutique();
    if (!boutique) return '';
    const jour = this.getJourActuel() as keyof typeof boutique.horaires;
    return boutique.horaires[jour];
  }

  isOuvert(): boolean {
    const horaires = this.getHorairesAujourdhui();
    if (horaires === 'Fermé') return false;
    // Simplification - en réalité il faudrait vérifier l'heure actuelle
    return true;
  }

  addToCart(produit: Produit): void {
    const boutique = this.boutique();
    if (!boutique || !produit.disponible) return;

    this.cartService.addItem(produit, boutique.id, boutique.nom);

    // Show feedback
    this.addedToCart.set(produit.id);
    setTimeout(() => {
      this.addedToCart.set(null);
    }, 2000);
  }

  isInCart(produitId: string): boolean {
    const boutique = this.boutique();
    if (!boutique) return false;
    return this.cartService.items().some(
      item => item.produit.id === produitId && item.boutiqueId === boutique.id
    );
  }
}
