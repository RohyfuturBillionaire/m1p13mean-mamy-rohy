import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { BoutiqueApiService, BoutiqueApi, ArticleApi } from '../../core/services/boutique-api.service';
import { CartService } from '../../core/services/cart.service';
import { FavoriteApiService } from '../../core/services/favorite-api.service';
import { RatingApiService } from '../../core/services/rating-api.service';
import { AuthService } from '../../auth/services/auth.service';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { Produit } from '../../core/models/boutique.model';

@Component({
  selector: 'app-boutique-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent],
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
  favoriteIds = signal<Set<string>>(new Set());
  articleRatings = signal<Map<string, { moyenne: number; count: number; userNote: number | null }>>(new Map());

  private favoriteApi = inject(FavoriteApiService);
  private ratingApi = inject(RatingApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

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
    this.loadFavorites();
  }

  private loadFavorites(): void {
    if (!this.authService.getAccessToken()) return;
    this.favoriteApi.getFavorites().subscribe({
      next: (favs) => {
        const ids = new Set<string>(favs.map((f: any) => f._id || f.id));
        this.favoriteIds.set(ids);
      },
      error: () => {}
    });
  }

  isFavorite(articleId: string): boolean {
    return this.favoriteIds().has(articleId);
  }

  toggleFavorite(articleId: string): void {
    if (!this.authService.getAccessToken()) {
      this.router.navigate(['/connexion']);
      return;
    }
    if (this.isFavorite(articleId)) {
      this.favoriteIds.update(ids => { const n = new Set(ids); n.delete(articleId); return n; });
      this.favoriteApi.removeFavorite(articleId).subscribe({ error: () => {
        this.favoriteIds.update(ids => { const n = new Set(ids); n.add(articleId); return n; });
      }});
    } else {
      this.favoriteIds.update(ids => { const n = new Set(ids); n.add(articleId); return n; });
      this.favoriteApi.addFavorite(articleId).subscribe({ error: () => {
        this.favoriteIds.update(ids => { const n = new Set(ids); n.delete(articleId); return n; });
      }});
    }
  }

  private loadBoutique(id: string) {
    this.loading.set(true);
    this.boutiqueApi.getById(id).subscribe({
      next: (boutique) => {
        this.boutique.set(boutique);
        this.articles.set(boutique.articles || []);
        this.loading.set(false);
        this.loadRatings(boutique.articles || []);
      },
      error: () => {
        this.boutique.set(null);
        this.loading.set(false);
      }
    });
  }

  private loadRatings(articles: ArticleApi[]): void {
    for (const article of articles) {
      this.ratingApi.getArticleRating(article._id).subscribe({
        next: (rating) => {
          this.articleRatings.update(map => {
            const n = new Map(map);
            n.set(article._id, rating);
            return n;
          });
        },
        error: () => {}
      });
    }
  }

  getArticleRating(articleId: string): { moyenne: number; count: number } {
    const r = this.articleRatings().get(articleId);
    return r ? { moyenne: r.moyenne, count: r.count } : { moyenne: 0, count: 0 };
  }

  rateArticle(articleId: string, note: number): void {
    if (!this.authService.getAccessToken()) {
      this.router.navigate(['/connexion']);
      return;
    }
    this.ratingApi.rateArticle(articleId, note).subscribe({
      next: () => {
        this.ratingApi.getArticleRating(articleId).subscribe({
          next: (rating) => {
            this.articleRatings.update(map => {
              const n = new Map(map);
              n.set(articleId, rating);
              return n;
            });
          }
        });
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
