import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../../core/services/seller.service';
import { SellerFAQ } from '../../core/models/seller.model';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent implements OnInit {
  faqs = signal<SellerFAQ[]>([]);
  showModal = signal(false);
  editingFaq = signal<SellerFAQ | null>(null);
  isSubmitting = signal(false);
  expandedId = signal<string | null>(null);

  formData = signal({ question: '', reponse: '', categorie: '', ordre: 0 });

  constructor(private sellerService: SellerService) {}

  ngOnInit() { this.loadFaqs(); }

  loadFaqs() {
    this.sellerService.getFAQs().subscribe(f => this.faqs.set(f));
  }

  toggleExpand(id: string) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  openModal(faq?: SellerFAQ) {
    if (faq) {
      this.editingFaq.set(faq);
      this.formData.set({ question: faq.question, reponse: faq.reponse, categorie: faq.categorie, ordre: faq.ordre });
    } else {
      this.editingFaq.set(null);
      this.formData.set({ question: '', reponse: '', categorie: '', ordre: this.faqs().length + 1 });
    }
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); this.editingFaq.set(null); }

  updateField(field: string, value: any) {
    this.formData.update(d => ({ ...d, [field]: value }));
  }

  submitForm() {
    const data = this.formData();
    if (!data.question || !data.reponse) return;
    this.isSubmitting.set(true);

    const faqData = { ...data, boutiqueId: 'b1', actif: true };
    const editing = this.editingFaq();

    if (editing) {
      this.sellerService.updateFAQ(editing.id, faqData).subscribe(() => {
        this.isSubmitting.set(false); this.closeModal(); this.loadFaqs();
      });
    } else {
      this.sellerService.addFAQ(faqData).subscribe(() => {
        this.isSubmitting.set(false); this.closeModal(); this.loadFaqs();
      });
    }
  }

  deleteFaq(faq: SellerFAQ) {
    if (confirm('Supprimer cette FAQ ?')) {
      this.sellerService.deleteFAQ(faq.id).subscribe(() => this.loadFaqs());
    }
  }

  toggleActive(faq: SellerFAQ) {
    this.sellerService.updateFAQ(faq.id, { actif: !faq.actif }).subscribe(() => this.loadFaqs());
  }
}
