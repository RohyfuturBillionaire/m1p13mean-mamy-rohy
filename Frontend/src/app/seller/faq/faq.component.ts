import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaqService } from './services/faq.service';
import { FaqCategoriesService } from './services/faq-categories.service';

export interface FaqDB {
  _id: string;
  question: string;
  reponse: string;
  id_boutique: string | { _id: string; nom_boutique: string };
  id_categorie: string | { _id: string; nom_categorie: string };
  ordre: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FaqCategoryDB {
  _id: string;
  nom_categorie: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent implements OnInit {
  faqs = signal<FaqDB[]>([]);
  faqCategories = signal<FaqCategoryDB[]>([]);
  expandedId = signal<string | null>(null);
  
  showModal = signal(false);
  editingFaq = signal<FaqDB | null>(null);
  isSubmitting = signal(false);
  isLoading = signal(true);
  
  formData = signal<Partial<FaqDB>>({
    question: '',
    reponse: '',
    id_categorie: '',
    ordre: 1
  });

  private boutiqueId: string = '';

  constructor(
    private faqService: FaqService,
    private faqCategoriesService: FaqCategoriesService
  ) {}

  ngOnInit() {
    this.loadBoutiqueId();
    this.loadFaqs();
    this.loadCategories();
  }

  private loadBoutiqueId() {
    const boutiqueStr = localStorage.getItem('boutiqueInfo');
    if (boutiqueStr) {
      const boutique = JSON.parse(boutiqueStr);
      // Récupérer l'ID de la boutique associée à l'utilisateur
      this.boutiqueId = boutique._id || '';
    }
  }

  loadFaqs() {
    this.isLoading.set(true);
    this.faqService.getFaqs().subscribe({
      next: (data) => {
        console.log('FAQs loaded:', data);
        // Filtrer les FAQs de la boutique si nécessaire
        const filteredFaqs = this.boutiqueId 
          ? data.filter((faq: FaqDB) => {
              const boutiqueId = typeof faq.id_boutique === 'string' 
                ? faq.id_boutique 
                : faq.id_boutique?._id;
              return boutiqueId === this.boutiqueId;
            })
          : data;
        this.faqs.set(filteredFaqs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading FAQs:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadCategories() {
    this.faqCategoriesService.getFaqCategories().subscribe({
      next: (data) => {
        console.log('FAQ Categories loaded:', data);
        this.faqCategories.set(data);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  toggleExpand(id: string) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  getCategoryName(faq: FaqDB): string {
    if (!faq.id_categorie) return '';
    if (typeof faq.id_categorie === 'string') {
      const category = this.faqCategories().find(c => c._id === faq.id_categorie);
      return category?.nom_categorie || '';
    }
    return faq.id_categorie.nom_categorie || '';
  }

  openModal(faq?: FaqDB) {
    if (faq) {
      this.editingFaq.set(faq);
      this.formData.set({
        question: faq.question,
        reponse: faq.reponse,
        id_categorie: typeof faq.id_categorie === 'string' ? faq.id_categorie : faq.id_categorie?._id,
        ordre: faq.ordre
      });
    } else {
      this.editingFaq.set(null);
      this.formData.set({
        question: '',
        reponse: '',
        id_categorie: '',
        ordre: this.faqs().length + 1
      });
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingFaq.set(null);
    this.formData.set({
      question: '',
      reponse: '',
      id_categorie: '',
      ordre: 1
    });
  }

  updateField(field: string, value: any) {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  submitForm() {
    if (!this.formData().question || !this.formData().reponse) {
      return;
    }

    this.isSubmitting.set(true);
    const faqData = {
      ...this.formData(),
      id_boutique: this.boutiqueId
    };

    console.log('Submitting FAQ data:', this.formData());

    if (this.editingFaq()) {
      // Update
      this.faqService.updateFaq(this.editingFaq()!._id, faqData).subscribe({
        next: () => {
          console.log('FAQ updated');
          this.loadFaqs();
          this.closeModal();
          this.isSubmitting.set(false);
        },
        error: (err) => {
          console.error('Error updating FAQ:', err);
          this.isSubmitting.set(false);
        }
      });
    } else {
      // Create
      this.faqService.addFaq(faqData).subscribe({
        next: () => {
          console.log('FAQ created');
          this.loadFaqs();
          this.closeModal();
          this.isSubmitting.set(false);
        },
        error: (err) => {
          console.error('Error creating FAQ:', err);
          this.isSubmitting.set(false);
        }
      });
    }
  }

  deleteFaq(faq: FaqDB) {
    if (confirm(`Supprimer la FAQ "${faq.question}" ?`)) {
      this.faqService.deleteFaq(faq._id).subscribe({
        next: () => {
          console.log('FAQ deleted');
          this.loadFaqs();
        },
        error: (err) => {
          console.error('Error deleting FAQ:', err);
        }
      });
    }
  }
}