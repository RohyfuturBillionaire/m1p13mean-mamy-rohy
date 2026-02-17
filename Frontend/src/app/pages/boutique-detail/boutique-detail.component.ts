import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { BoutiqueApiService, BoutiqueApi, ArticleApi } from '../../core/services/boutique-api.service';
import { CartService } from '../../core/services/cart.service';
import { Produit } from '../../core/models/boutique.model';

@Component({
  selector: 'app-boutique-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './boutique-detail.component.html',
  styleUrl: './boutique-detail.component.scss'
})
export class BoutiqueDetailComponent implements OnInit {
  boutique = signal<BoutiqueApi | null>(null);
  articles = signal<ArticleApi[]>([]);
  loading = signal(true);
  selectedCategorie = signal<string>('all');
  activeTab = signal<'produits' | 'infos'>('produits');
  addedToCart = signal<string | null>(null);

  constructor(
    private boutiqueApi: BoutiqueApiService,
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
    this.boutiqueApi.getById(id).subscribe({
      next: (boutique) => {
        this.boutique.set(boutique);
        this.articles.set(boutique.articles || []);
        this.loading.set(false);
      },
      error: () => {
        this.boutique.set(null);
        this.loading.set(false);
      }
    });
  }

  getLogoUrl(boutique: BoutiqueApi): string {
    if (!boutique.logo) return 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800';
    if (boutique.logo.startsWith('http')) return boutique.logo;
    return 'http://localhost:5000' + boutique.logo;
  }

  getArticleImage(article: ArticleApi): string {
    if (article.images && article.images.length > 0) {
      const img = article.images[0];
      if (img.startsWith('http')) return img;
      return 'http://localhost:5000' + img;
    }
    return 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400';
  }

  get articleCategories(): string[] {
    const cats = new Set(this.articles().map(a => a.id_categorie_article?.nom || 'Autre'));
    return ['all', ...Array.from(cats)];
  }

  get filteredArticles(): ArticleApi[] {
    const all = this.articles();
    if (this.selectedCategorie() === 'all') return all;
    return all.filter(a => (a.id_categorie_article?.nom || 'Autre') === this.selectedCategorie());
  }

  setCategorie(categorie: string) {
    this.selectedCategorie.set(categorie);
  }

  setTab(tab: 'produits' | 'infos') {
    this.activeTab.set(tab);
  }

  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-MG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(prix) + ' Ar';
  }

  addToCart(article: ArticleApi): void {
    const boutique = this.boutique();
    if (!boutique) return;

    const produit: Produit = {
      id: article._id,
      nom: article.nom,
      description: article.description || '',
      prix: article.prix,
      image: this.getArticleImage(article),
      categorie: article.id_categorie_article?.nom || '',
      disponible: true,
      nouveau: false
    };

    this.cartService.addItem(produit, boutique._id, boutique.nom);
    this.addedToCart.set(article._id);
    setTimeout(() => this.addedToCart.set(null), 2000);
  }

  isInCart(articleId: string): boolean {
    const boutique = this.boutique();
    if (!boutique) return false;
    return this.cartService.items().some(
      item => item.produit.id === articleId && item.boutiqueId === boutique._id
    );
  }
}
