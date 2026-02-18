import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environments';
import { BoutiqueApi, BoutiqueApiService } from '../../core/services/boutique-api.service';
import { SellerService } from '../../core/services/seller.service';
// import { BoutiqueService } from '../../core/services/boutique.service';
// import { environment } from '../../../environments/environment';

export interface BoutiqueDB {
  _id: string;
  nom: string;
  logo?: string;
  email?: string;
  reseau?: string;
  horaire_ouvert?: string;
  id_categorie?: {
    _id: string;
    nom: string;
    icone: string;
    description: string;
  };
  local_boutique?: {
    _id: string;
    numero: string;
    etage: string;
    x: number;
    y: number;
    loyer: number;
  };
  loyer?: number;
  type_boutique?: string;
  status: boolean;
  description?: string;
  user_proprietaire?: {
    _id: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-profil-boutique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profil-boutique.component.html',
  styleUrl: './profil-boutique.component.scss'
})
export class ProfilBoutiqueComponent implements OnInit {
  boutique = signal<BoutiqueDB | null>(null);
  isEditing = signal(false);
  editData = signal<Partial<BoutiqueDB>>({});
  isLoading = signal(true);
  apiUrl = environment.apiUrl;

  constructor(private boutiqueService: BoutiqueApiService,private sellerService: SellerService) {}

  ngOnInit() {
    this.loadBoutique();
  }

  private loadBoutique() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const userId = user.user?.id || user.id;
      
      if (userId) {
        this.sellerService.getBoutiqueInfo(userId).subscribe({
          next: (boutique) => {
            console.log('Boutique loaded:', boutique);
            this.boutique.set(boutique);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Error loading boutique:', err);
            this.isLoading.set(false);
          }
        });
      }
    }
  }

  getLogoUrl(): string {
    const logo = this.boutique()?.logo;
    if (logo) {
      if (logo.startsWith('http')) {
        return logo;
      }
      return `${this.apiUrl}${logo}`;
    }
    return 'assets/images/default-shop.png';
  }

  toggleEdit() {
    if (this.isEditing()) {
      this.isEditing.set(false);
    } else {
      this.editData.set({
        nom: this.boutique()?.nom,
        description: this.boutique()?.description,
        email: this.boutique()?.email,
        reseau: this.boutique()?.reseau,
        horaire_ouvert: this.boutique()?.horaire_ouvert,
        type_boutique: this.boutique()?.type_boutique
      });
      this.isEditing.set(true);
    }
  }

  updateField(field: string, value: any) {
    this.editData.update(data => ({ ...data, [field]: value }));
  }

  saveChanges() {
    const boutiqueId = this.boutique()?._id;
    if (boutiqueId && this.editData()) {
      this.boutiqueService.update(boutiqueId, this.editData()).subscribe({
        next: (updated) => {
          console.log('Boutique updated:', updated);
          this.boutique.set({ ...this.boutique()!, ...this.editData() });
          this.isEditing.set(false);
        },
        error: (err) => {
          console.error('Error updating boutique:', err);
        }
      });
    }
  }

  toggleStatus() {
    const boutiqueId = this.boutique()?._id;
    const newStatus = !this.boutique()?.status;
    
    if (boutiqueId) {
      this.boutiqueService.update(boutiqueId, { status: newStatus }).subscribe({
        next: () => {
          this.boutique.update(b => b ? { ...b, status: newStatus } : null);
        },
        error: (err) => {
          console.error('Error toggling status:', err);
        }
      });
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editData.set({});
  }
}
