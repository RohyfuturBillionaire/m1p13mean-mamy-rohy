import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FaqService, Faq, FaqCategorie } from '../../core/services/faq.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent implements OnInit {
  faqs = signal<Faq[]>([]);
  categories = signal<FaqCategorie[]>([]);
  isLoading = signal(true);
  selectedCategory = signal<string>('all');
  openItemId = signal<string | null>(null);

  filteredFaqs = computed(() => {
    const cat = this.selectedCategory();
    const all = this.faqs();
    if (cat === 'all') return all;
    return all.filter(f => f.id_categorie === cat);
  });

  constructor(private faqService: FaqService) {}

  ngOnInit(): void {
    forkJoin({
      faqs: this.faqService.getAll(),
      categories: this.faqService.getCategories()
    }).subscribe({
      next: ({ faqs, categories }) => {
        this.faqs.set(faqs.sort((a, b) => a.ordre - b.ordre));
        this.categories.set(categories);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  selectCategory(id: string): void {
    this.selectedCategory.set(id);
    this.openItemId.set(null);
  }

  toggle(id: string): void {
    this.openItemId.update(current => (current === id ? null : id));
  }

  isOpen(id: string): boolean {
    return this.openItemId() === id;
  }

  getCategoryName(categoryId: string): string {
    return this.categories().find(c => c._id === categoryId)?.nom_categorie ?? '';
  }

  /** Returns categories that actually have at least one FAQ */
  usedCategories = computed(() => {
    const usedIds = new Set(this.faqs().map(f => f.id_categorie));
    return this.categories().filter(c => usedIds.has(c._id));
  });
}
