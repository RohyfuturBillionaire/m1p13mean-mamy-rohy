import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FavoriteApiService } from '../../core/services/favorite-api.service';
import { environment } from '../../../environments/environments';
import { AuthService } from '../../auth/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { Produit } from '../../core/models/boutique.model';

@Component({
  selector: 'app-mes-favoris',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="favorites-page">
      <div class="container">
        <div class="page-header">
          <a routerLink="/boutiques" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Retour aux boutiques
          </a>
          <h1>Mes Favoris</h1>
          <p>{{ favorites().length }} article{{ favorites().length > 1 ? 's' : '' }} dans vos favoris</p>
        </div>

        @if (loading()) {
          <div class="loading-state">
            <div class="loader"></div>
            <p>Chargement...</p>
          </div>
        } @else if (favorites().length === 0) {
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h2>Aucun favori</h2>
            <p>Ajoutez des articles a vos favoris pour les retrouver ici</p>
            <a routerLink="/boutiques" class="btn btn-primary">Decouvrir nos boutiques</a>
          </div>
        } @else {
          <div class="favorites-grid">
            @for (article of favorites(); track article._id) {
              <div class="favorite-card">
                <div class="card-image">
                  <img [src]="getImage(article)" [alt]="article.nom" loading="lazy">
                  <button class="remove-btn" (click)="removeFavorite(article._id)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
                <div class="card-content">
                  @if (article.id_categorie_article?.nom) {
                    <span class="card-category">{{ article.id_categorie_article.nom }}</span>
                  }
                  <h3>{{ article.nom }}</h3>
                  <p class="card-description">{{ article.description }}</p>
                  <div class="card-footer">
                    <span class="card-price">{{ formatPrix(article.prix) }}</span>
                    <button class="add-cart-btn" (click)="addToCart(article)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .favorites-page { min-height: 70vh; padding: 2rem 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { font-size: 2rem; font-weight: 700; margin: 0.5rem 0; }
    .page-header p { color: #6B7280; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: #6B7280; text-decoration: none; font-size: 0.875rem;
      &:hover { color: #111; }
    }
    .loading-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 40vh; gap: 1rem;
    }
    .loader {
      width: 40px; height: 40px; border: 3px solid #E5E7EB;
      border-top-color: #3B82F6; border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state {
      text-align: center; padding: 4rem 0;
      svg { color: #D1D5DB; margin-bottom: 1rem; }
      h2 { font-size: 1.5rem; margin-bottom: 0.5rem; }
      p { color: #6B7280; margin-bottom: 1.5rem; }
    }
    .btn-primary {
      display: inline-block; padding: 0.75rem 1.5rem;
      background: #3B82F6; color: white; border-radius: 8px;
      text-decoration: none; font-weight: 500;
      &:hover { background: #2563EB; }
    }
    .favorites-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;
    }
    .favorite-card {
      background: white; border-radius: 12px; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.3s ease;
      &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); transform: translateY(-2px); }
    }
    .card-image {
      position: relative; aspect-ratio: 1; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .remove-btn {
      position: absolute; top: 0.75rem; right: 0.75rem;
      background: rgba(255,255,255,0.9); border: none; border-radius: 50%;
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      &:hover { background: white; transform: scale(1.1); }
    }
    .card-content { padding: 1rem; }
    .card-category {
      font-size: 0.75rem; color: #3B82F6; font-weight: 500; text-transform: uppercase;
    }
    .card-content h3 { font-size: 1rem; font-weight: 600; margin: 0.25rem 0; }
    .card-description {
      font-size: 0.85rem; color: #6B7280; display: -webkit-box;
      -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .card-footer {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 0.75rem; gap: 0.5rem;
    }
    .card-price { font-size: 1.1rem; font-weight: 700; color: #111; }
    .add-cart-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1rem; background: #3B82F6; color: white;
      border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 500;
      cursor: pointer; transition: background 0.2s;
      &:hover { background: #2563EB; }
    }
  `]
})
export class MesFavorisComponent implements OnInit {
  favorites = signal<any[]>([]);
  loading = signal(true);

  private favoriteApi = inject(FavoriteApiService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);

  ngOnInit() {
    if (!this.authService.getAccessToken()) {
      this.router.navigate(['/connexion']);
      return;
    }
    this.loadFavorites();
  }

  private loadFavorites(): void {
    this.favoriteApi.getFavorites().subscribe({
      next: (articles) => {
        this.favorites.set(articles);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getImage(article: any): string {
    if (article.images && article.images.length > 0) {
      const img = article.images[0];
      return img.startsWith('http') ? img : environment.apiUrl + img;
    }
    return 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400';
  }

  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-MG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(prix) + ' Ar';
  }

  removeFavorite(articleId: string): void {
    this.favorites.update(favs => favs.filter(f => (f._id || f.id) !== articleId));
    this.favoriteApi.removeFavorite(articleId).subscribe({
      error: () => this.loadFavorites()
    });
  }

  addToCart(article: any): void {
    const produit: Produit = {
      id: article._id,
      nom: article.nom,
      description: article.description || '',
      prix: article.prix,
      image: this.getImage(article),
      categorie: article.id_categorie_article?.nom || '',
      disponible: true,
      nouveau: false
    };
    const boutiqueId = typeof article.id_boutique === 'object' ? article.id_boutique._id : article.id_boutique;
    const boutiqueNom = typeof article.id_boutique === 'object' ? article.id_boutique.nom : 'Boutique';
    this.cartService.addItem(produit, boutiqueId, boutiqueNom);
  }
}
