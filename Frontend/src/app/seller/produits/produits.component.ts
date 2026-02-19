import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleApiService } from '../../core/services/article-api.service';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produits.component.html',
  styleUrl: './produits.component.scss'
})
export class ProduitsComponent implements OnInit {
  produits = signal<any[]>([]);
  filteredProduits = signal<any[]>([]);
  categories = signal<any[]>([]);

  // Filters
  searchQuery = signal('');
  categoryFilter = signal<string>('all');

  // Modal
  showModal = signal(false);
  editingProduit = signal<any | null>(null);
  isSubmitting = signal(false);

  // Form data
  formData = signal({
    nom: '',
    description: '',
    prix: 0,
    id_categorie_article: '',
    newCategorie: '',
    stock: 0,
    stockAlerte: 5
  });

  // Image file handling
  selectedFiles = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);

  // Delete confirmation
  showDeleteModal = signal(false);
  deletingProduit = signal<any | null>(null);

  boutiqueId = '';

  stats = computed(() => {
    const prods = this.produits();
    return {
      total: prods.length,
      actifs: prods.filter(p => p.actif !== false).length,
      inactifs: prods.filter(p => p.actif === false).length,
      rupture: prods.filter(p => p.stock === 0).length,
      alerteStock: prods.filter(p => p.stock > 0 && p.stock <= p.seuil_alerte).length
    };
  });

  constructor(private articleApi: ArticleApiService) {}

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      this.boutiqueId = parsed.user?.boutiqueId || parsed.user?.id || '';
    }
    this.loadProduits();
    this.loadCategories();
  }

  loadProduits() {
    this.articleApi.getArticles(this.boutiqueId || undefined).subscribe({
      next: (articles) => {
        this.produits.set(articles);
        this.applyFilters();
      },
      error: (err) => console.error('Erreur chargement articles:', err)
    });
  }

  loadCategories() {
    if (this.boutiqueId) {
      this.articleApi.getCategories(this.boutiqueId).subscribe({
        next: (cats) => this.categories.set(cats),
        error: (err) => console.error('Erreur chargement catégories:', err)
      });
    }
  }

  applyFilters() {
    let filtered = [...this.produits()];

    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(p =>
        p.nom.toLowerCase().includes(query) ||
        (p.description || '').toLowerCase().includes(query)
      );
    }

    const cat = this.categoryFilter();
    if (cat !== 'all') {
      filtered = filtered.filter(p => p.id_categorie_article?._id === cat);
    }

    this.filteredProduits.set(filtered);
  }

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.applyFilters();
  }

  onCategoryFilter(event: Event) {
    this.categoryFilter.set((event.target as HTMLSelectElement).value);
    this.applyFilters();
  }

  openAddModal() {
    this.editingProduit.set(null);
    this.formData.set({
      nom: '',
      description: '',
      prix: 0,
      id_categorie_article: '',
      newCategorie: '',
      stock: 0,
      stockAlerte: 5
    });
    this.selectedFiles.set([]);
    this.imagePreviews.set([]);
    this.showModal.set(true);
  }

  openEditModal(produit: any) {
    this.editingProduit.set(produit);
    this.formData.set({
      nom: produit.nom,
      description: produit.description || '',
      prix: produit.prix,
      id_categorie_article: produit.id_categorie_article?._id || '',
      newCategorie: '',
      stock: produit.stock || 0,
      stockAlerte: produit.seuil_alerte || 5
    });
    this.selectedFiles.set([]);
    // Show existing images as previews
    const existing = (produit.images || []).map((img: string) =>
      img.startsWith('/') ? `${environment.apiUrl}${img}` : img
    );
    this.imagePreviews.set(existing);
    this.showModal.set(true);
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    this.selectedFiles.set(files);

    // Generate previews
    const previews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        previews.push(reader.result as string);
        this.imagePreviews.set([...previews]);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    const files = [...this.selectedFiles()];
    const previews = [...this.imagePreviews()];
    files.splice(index, 1);
    previews.splice(index, 1);
    this.selectedFiles.set(files);
    this.imagePreviews.set(previews);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProduit.set(null);
  }

  updateFormField(field: string, value: any) {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  submitForm() {
    const data = this.formData();
    if (!data.nom || data.prix <= 0) return;

    this.isSubmitting.set(true);

    if (data.newCategorie && !data.id_categorie_article) {
      this.articleApi.createCategory({
        categorie_article: data.newCategorie,
        id_boutique: this.boutiqueId
      }).subscribe({
        next: (cat) => {
          this.saveArticle(data, cat._id);
          this.loadCategories();
        },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      this.saveArticle(data, data.id_categorie_article);
    }
  }

  private saveArticle(data: any, categorieId: string) {
    const formData = new FormData();
    formData.append('nom', data.nom);
    formData.append('description', data.description || '');
    formData.append('prix', String(data.prix));
    formData.append('id_boutique', this.boutiqueId);
    formData.append('stock', String(data.stock));
    formData.append('seuil_alerte', String(data.stockAlerte));
    if (categorieId) {
      formData.append('id_categorie_article', categorieId);
    }

    // Append image files
    for (const file of this.selectedFiles()) {
      formData.append('images', file);
    }

    const editing = this.editingProduit();
    const obs = editing
      ? this.articleApi.updateArticle(editing._id, formData)
      : this.articleApi.createArticle(formData);

    obs.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.loadProduits();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Erreur sauvegarde article:', err);
      }
    });
  }

  confirmDelete(produit: any) {
    this.deletingProduit.set(produit);
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.deletingProduit.set(null);
  }

  toggleActif(produit: any) {
    this.articleApi.toggleArticle(produit._id).subscribe({
      next: (res) => {
        // Update locally without reloading
        const updated = this.produits().map(p =>
          p._id === produit._id ? { ...p, actif: res.actif } : p
        );
        this.produits.set(updated);
        this.applyFilters();
      },
      error: (err) => console.error('Erreur toggle:', err)
    });
  }

  deleteProduct() {
    const produit = this.deletingProduit();
    if (produit) {
      this.articleApi.deleteArticle(produit._id).subscribe({
        next: () => {
          this.cancelDelete();
          this.loadProduits();
        },
        error: (err) => console.error('Erreur suppression:', err)
      });
    }
  }

  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA' }).format(prix);
  }

  getImageUrl(path: string): string {
    if (path.startsWith('/')) return `${environment.apiUrl}${path}`;
    return path;
  }

  getStockClass(produit: any): string {
    if (produit.stock === 0) return 'out';
    if (produit.stock <= produit.seuil_alerte) return 'low';
    return '';
  }

  getStatusLabel(produit: any): string {
    if (produit.actif === false) return 'Inactif';
    if (produit.stock === 0) return 'Rupture';
    if (produit.stock <= produit.seuil_alerte) return 'Stock faible';
    return 'En stock';
  }

  getStatusClass(produit: any): string {
    if (produit.actif === false) return 'inactif';
    if (produit.stock === 0) return 'rupture';
    if (produit.stock <= produit.seuil_alerte) return 'alerte';
    return 'actif';
  }
}
