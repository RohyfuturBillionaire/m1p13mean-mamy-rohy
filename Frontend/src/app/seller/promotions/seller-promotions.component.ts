import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionService, PromotionApi } from '../../core/services/promotion.service';
import { ArticleApiService } from '../../core/services/article-api.service';
import { environment } from '../../../environments/environments';
import { ArticleApi } from '../../core/services/boutique-api.service';

@Component({
  selector: 'app-seller-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-promotions.component.html',
  styleUrl: './seller-promotions.component.scss'
})
export class SellerPromotionsComponent implements OnInit {
  promotions = signal<PromotionApi[]>([]);
  articles = signal<ArticleApi[]>([]);
  showModal = signal(false);
  editingPromo = signal<PromotionApi | null>(null);
  isSubmitting = signal(false);

  selectedImageFile: File | null = null;
  imagePreview: string | null = null;

  // Live search for articles (signals for reactivity)
  articleSearch = signal('');
  showArticleDropdown = false;
  selectedArticleId = signal('');

  form: any = this.getEmptyForm();

  // Current boutique from localStorage
  private currentBoutiqueId: string = '';

  filteredArticles = computed(() => {
    const search = this.articleSearch().toLowerCase();
    const list = this.articles();
    if (!search) return list;
    return list.filter(a => a.nom.toLowerCase().includes(search));
  });

  selectedArticle = computed(() => {
    const id = this.selectedArticleId();
    if (!id) return null;
    return this.articles().find(a => a._id === id) || null;
  });

  constructor(
    private promotionService: PromotionService,
    private articleApiService: ArticleApiService
  ) {
    // Get boutiqueId from localStorage
    try {
      const boutiqueInfo = JSON.parse(localStorage.getItem('boutiqueInfo') || '{}');
      this.currentBoutiqueId = boutiqueInfo?._id || boutiqueInfo?.boutiqueId || '';
      if (!this.currentBoutiqueId) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        this.currentBoutiqueId = userData?.user?.boutiqueId || '';
      }
    } catch {}
  }

  ngOnInit() {
    this.loadData();
  }

  private getEmptyForm() {
    return {
      titre: '',
      description: '',
      remise: 0,
      date_debut: '',
      date_fin: '',
      id_article: '',
      id_boutique: ''
    };
  }

  private loadData() {
    // Load only articles of the current boutique
    if (this.currentBoutiqueId) {
      this.articleApiService.getArticles(this.currentBoutiqueId).subscribe(a => this.articles.set(a));
    } else {
      this.articleApiService.getArticles().subscribe(a => this.articles.set(a));
    }
    this.loadPromotions();
  }

  loadPromotions() {
    if (this.currentBoutiqueId) {
      this.promotionService.getByBoutique(this.currentBoutiqueId).subscribe(p => this.promotions.set(p));
    } else {
      this.promotionService.getAll().subscribe(p => this.promotions.set(p));
    }
  }

  openModal(promo?: PromotionApi) {
    if (promo) {
      this.editingPromo.set(promo);
      this.form = {
        titre: promo.titre,
        description: promo.description || '',
        remise: promo.remise,
        date_debut: new Date(promo.date_debut).toISOString().split('T')[0],
        date_fin: new Date(promo.date_fin).toISOString().split('T')[0],
        id_article: typeof promo.id_article === 'object' ? (promo.id_article as any)._id : promo.id_article,
        id_boutique: typeof promo.id_boutique === 'object' ? (promo.id_boutique as any)._id : promo.id_boutique
      };
      this.imagePreview = promo.image ? environment.apiUrl + promo.image : null;
      const artId = typeof promo.id_article === 'object' ? (promo.id_article as any)._id : promo.id_article;
      this.selectedArticleId.set(artId || '');
      const artName = typeof promo.id_article === 'object' ? ((promo.id_article as any).nom || '') : '';
      this.articleSearch.set(artName);
    } else {
      this.editingPromo.set(null);
      this.form = this.getEmptyForm();
      // Pre-fill boutique with current seller's boutique
      if (this.currentBoutiqueId) {
        this.form.id_boutique = this.currentBoutiqueId;
      }
      this.imagePreview = null;
      this.selectedArticleId.set('');
      this.articleSearch.set('');
    }
    this.showArticleDropdown = false;
    this.selectedImageFile = null;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingPromo.set(null);
    this.selectedImageFile = null;
    this.imagePreview = null;
    this.articleSearch.set('');
    this.selectedArticleId.set('');
    this.showArticleDropdown = false;
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }

  onArticleSearchFocus() {
    this.showArticleDropdown = true;
  }

  onArticleSearchBlur() {
    // Delay to allow click on dropdown item
    setTimeout(() => { this.showArticleDropdown = false; }, 200);
  }

  selectArticle(article: ArticleApi) {
    this.form.id_article = article._id;
    this.selectedArticleId.set(article._id);
    this.articleSearch.set(article.nom);
    this.showArticleDropdown = false;
  }

  getArticleImageUrl(article: ArticleApi): string {
    if (!article.images || article.images.length === 0) return '';
    const img = article.images[0];
    if (img.startsWith('http')) return img;
    return environment.apiUrl + img;
  }

  submitForm() {
    if (!this.form.titre || !this.form.date_debut || !this.form.date_fin || !this.form.id_article || !this.form.id_boutique) return;
    this.isSubmitting.set(true);

    const formData = new FormData();
    formData.append('titre', this.form.titre);
    formData.append('description', this.form.description);
    formData.append('remise', String(this.form.remise));
    formData.append('date_debut', this.form.date_debut);
    formData.append('date_fin', this.form.date_fin);
    formData.append('id_article', this.form.id_article);
    formData.append('id_boutique', this.form.id_boutique);
    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }

    const editing = this.editingPromo();
    if (editing) {
      this.promotionService.update(editing._id, formData).subscribe({
        next: () => { this.isSubmitting.set(false); this.closeModal(); this.loadPromotions(); },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      this.promotionService.create(formData).subscribe({
        next: () => { this.isSubmitting.set(false); this.closeModal(); this.loadPromotions(); },
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  deletePromo(promo: PromotionApi) {
    if (confirm('Supprimer cette promotion ?')) {
      this.promotionService.delete(promo._id).subscribe(() => this.loadPromotions());
    }
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'APPROVED': 'Validee',
      'REJECTED': 'Refusee'
    };
    return labels[status] || status;
  }

  getBoutiqueName(promo: PromotionApi): string {
    if (typeof promo.id_boutique === 'object') return (promo.id_boutique as any).nom;
    return '';
  }

  getArticleName(promo: PromotionApi): string {
    if (typeof promo.id_article === 'object') return (promo.id_article as any).nom || (promo.id_article as any).title || '';
    return '';
  }

  getImageUrl(promo: PromotionApi): string {
    if (!promo.image) return '';
    if (promo.image.startsWith('http')) return promo.image;
    return environment.apiUrl + promo.image;
  }
}
