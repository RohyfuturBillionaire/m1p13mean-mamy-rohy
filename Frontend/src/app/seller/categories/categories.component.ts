import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleApiService } from '../../core/services/article-api.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  categories = signal<any[]>([]);
  boutiqueId = '';

  // Modal
  showModal = signal(false);
  editingCategory = signal<any | null>(null);
  isSubmitting = signal(false);
  categoryName = signal('');

  // Delete
  showDeleteModal = signal(false);
  deletingCategory = signal<any | null>(null);

  constructor(private articleApi: ArticleApiService) {}

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      this.boutiqueId = parsed.user?.boutiqueId || parsed.user?.id || '';
    }
    this.loadCategories();
  }

  loadCategories() {
    if (this.boutiqueId) {
      this.articleApi.getCategories(this.boutiqueId).subscribe({
        next: (cats) => this.categories.set(cats),
        error: (err) => console.error('Erreur chargement catégories:', err)
      });
    }
  }

  openAddModal() {
    this.editingCategory.set(null);
    this.categoryName.set('');
    this.showModal.set(true);
  }

  openEditModal(cat: any) {
    this.editingCategory.set(cat);
    this.categoryName.set(cat.categorie_article);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingCategory.set(null);
    this.categoryName.set('');
  }

  submitForm() {
    const name = this.categoryName().trim();
    if (!name) return;

    this.isSubmitting.set(true);
    const editing = this.editingCategory();

    if (editing) {
      this.articleApi.updateCategory(editing._id, {
        categorie_article: name,
        id_boutique: this.boutiqueId
      }).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.loadCategories();
        },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      this.articleApi.createCategory({
        categorie_article: name,
        id_boutique: this.boutiqueId
      }).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.loadCategories();
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  confirmDelete(cat: any) {
    this.deletingCategory.set(cat);
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.deletingCategory.set(null);
  }

  deleteCategory() {
    const cat = this.deletingCategory();
    if (cat) {
      this.articleApi.deleteCategory(cat._id).subscribe({
        next: () => {
          this.cancelDelete();
          this.loadCategories();
        },
        error: (err) => console.error('Erreur suppression:', err)
      });
    }
  }
}
