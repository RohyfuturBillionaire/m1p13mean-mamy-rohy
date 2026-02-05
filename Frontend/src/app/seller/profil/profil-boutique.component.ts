import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../../core/services/seller.service';
import { SellerBoutique } from '../../core/models/seller.model';

@Component({
  selector: 'app-profil-boutique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profil-boutique.component.html',
  styleUrl: './profil-boutique.component.scss'
})
export class ProfilBoutiqueComponent implements OnInit {
  boutique = signal<SellerBoutique | null>(null);
  isEditing = signal(false);
  isSaving = signal(false);
  editData = signal<Partial<SellerBoutique>>({});

  constructor(private sellerService: SellerService) {}

  ngOnInit() {
    this.sellerService.getBoutique().subscribe(b => this.boutique.set(b));
  }

  toggleEdit() {
    if (this.isEditing()) {
      this.isEditing.set(false);
    } else {
      const b = this.boutique();
      if (b) {
        this.editData.set({
          nom: b.nom, description: b.description, telephone: b.telephone, email: b.email,
          horaires: { ...b.horaires }
        });
      }
      this.isEditing.set(true);
    }
  }

  updateField(field: string, value: any) {
    this.editData.update(d => ({ ...d, [field]: value }));
  }

  updateHoraire(field: string, value: string) {
    this.editData.update(d => ({
      ...d,
      horaires: { ...(d.horaires || {}), [field]: value } as any
    }));
  }

  save() {
    this.isSaving.set(true);
    this.sellerService.updateBoutique(this.editData()).subscribe(updated => {
      this.boutique.set(updated);
      this.isSaving.set(false);
      this.isEditing.set(false);
    });
  }

  toggleStatus() {
    this.sellerService.toggleBoutiqueStatus().subscribe(() => {
      this.sellerService.getBoutique().subscribe(b => this.boutique.set(b));
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = { 'boutique': 'Boutique', 'restaurant': 'Restaurant', 'service': 'Service' };
    return labels[type] || type;
  }
}
