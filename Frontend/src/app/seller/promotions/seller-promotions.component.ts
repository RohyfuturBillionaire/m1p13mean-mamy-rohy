import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionService, PromotionApi, ArticleApi } from '../../core/services/promotion.service';
import { BoutiqueApiService, BoutiqueApi } from '../../core/services/boutique-api.service';

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
  boutiques = signal<BoutiqueApi[]>([]);
  showModal = signal(false);
  editingPromo = signal<PromotionApi | null>(null);
  isSubmitting = signal(false);

  selectedImageFile: File | null = null;
  imagePreview: string | null = null;

  form: any = this.getEmptyForm();
  selectedBoutiqueId = '';

  constructor(
    private promotionService: PromotionService,
    private boutiqueService: BoutiqueApiService
  ) {}

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
    this.promotionService.getArticles().subscribe(a => this.articles.set(a));
    this.boutiqueService.getAll().subscribe(b => this.boutiques.set(b));
    this.loadPromotions();
  }

  loadPromotions() {
    if (this.selectedBoutiqueId) {
      this.promotionService.getByBoutique(this.selectedBoutiqueId).subscribe(p => this.promotions.set(p));
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
        id_article: typeof promo.id_article === 'object' ? promo.id_article._id : promo.id_article,
        id_boutique: typeof promo.id_boutique === 'object' ? promo.id_boutique._id : promo.id_boutique
      };
      this.imagePreview = promo.image ? 'http://localhost:5000' + promo.image : null;
    } else {
      this.editingPromo.set(null);
      this.form = this.getEmptyForm();
      this.imagePreview = null;
    }
    this.selectedImageFile = null;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingPromo.set(null);
    this.selectedImageFile = null;
    this.imagePreview = null;
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
    if (typeof promo.id_boutique === 'object') return promo.id_boutique.nom;
    return '';
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
}
