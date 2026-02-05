import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../../core/services/seller.service';
import { SellerPromotion } from '../../core/models/seller.model';

@Component({
  selector: 'app-seller-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-promotions.component.html',
  styleUrl: './seller-promotions.component.scss'
})
export class SellerPromotionsComponent implements OnInit {
  promotions = signal<SellerPromotion[]>([]);
  showModal = signal(false);
  editingPromo = signal<SellerPromotion | null>(null);
  isSubmitting = signal(false);

  formData = signal({
    titre: '', description: '', type: 'pourcentage' as 'pourcentage' | 'montant' | 'offre',
    valeur: 0, dateDebut: '', dateFin: '', conditions: ''
  });

  constructor(private sellerService: SellerService) {}

  ngOnInit() { this.loadPromotions(); }

  loadPromotions() {
    this.sellerService.getPromotions().subscribe(p => this.promotions.set(p));
  }

  openModal(promo?: SellerPromotion) {
    if (promo) {
      this.editingPromo.set(promo);
      this.formData.set({
        titre: promo.titre, description: promo.description, type: promo.type,
        valeur: promo.valeur || 0,
        dateDebut: new Date(promo.dateDebut).toISOString().split('T')[0],
        dateFin: new Date(promo.dateFin).toISOString().split('T')[0],
        conditions: promo.conditions || ''
      });
    } else {
      this.editingPromo.set(null);
      this.formData.set({ titre: '', description: '', type: 'pourcentage', valeur: 0, dateDebut: '', dateFin: '', conditions: '' });
    }
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); this.editingPromo.set(null); }

  updateField(field: string, value: any) {
    this.formData.update(d => ({ ...d, [field]: value }));
  }

  submitForm() {
    const data = this.formData();
    if (!data.titre || !data.dateDebut || !data.dateFin) return;
    this.isSubmitting.set(true);

    const promoData = {
      ...data, boutiqueId: 'b1',
      dateDebut: new Date(data.dateDebut), dateFin: new Date(data.dateFin),
      statut: 'brouillon' as const
    };

    const editing = this.editingPromo();
    if (editing) {
      this.sellerService.updatePromotion(editing.id, promoData).subscribe(() => {
        this.isSubmitting.set(false); this.closeModal(); this.loadPromotions();
      });
    } else {
      this.sellerService.addPromotion(promoData).subscribe(() => {
        this.isSubmitting.set(false); this.closeModal(); this.loadPromotions();
      });
    }
  }

  submitForApproval(promo: SellerPromotion) {
    this.sellerService.submitPromotion(promo.id).subscribe(() => this.loadPromotions());
  }

  deletePromo(promo: SellerPromotion) {
    if (confirm('Supprimer cette promotion ?')) {
      this.sellerService.deletePromotion(promo.id).subscribe(() => this.loadPromotions());
    }
  }

  formatDate(date: Date): string { return this.sellerService.formatDate(date); }

  getStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      'brouillon': 'Brouillon', 'en_attente': 'En attente', 'validee': 'Validée',
      'refusee': 'Refusée', 'active': 'Active', 'expiree': 'Expirée'
    };
    return labels[statut] || statut;
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = { 'pourcentage': 'Réduction %', 'montant': 'Réduction fixe', 'offre': 'Offre spéciale' };
    return labels[type] || type;
  }
}
