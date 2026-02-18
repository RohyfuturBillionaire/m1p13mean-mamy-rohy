import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environments';
import { BoutiqueApiService } from '../../core/services/boutique-api.service';
import { SellerService } from '../../core/services/seller.service';
import { HoraireBoutiqueService } from './services/horaire-boutique.service';

export interface HoraireDB {
  _id: string;
  horaire_ouverture: string;
  horaire_fermeture: string;
  id_boutique: string;
  label: string;
  createdAt?: string;
  updatedAt?: string;
}

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
  horaires = signal<HoraireDB[]>([]);
  isEditing = signal(false);
  editData = signal<Partial<BoutiqueDB>>({});
  isLoading = signal(true);
  apiUrl = environment.apiUrl;

  // Horaire modal
  showHoraireModal = signal(false);
  editingHoraire = signal<HoraireDB | null>(null);
  horaireForm = signal<Partial<HoraireDB>>({
    label: '',
    horaire_ouverture: '',
    horaire_fermeture: ''
  });

  constructor(
    private boutiqueService: BoutiqueApiService,
    private sellerService: SellerService,
    private horaireService: HoraireBoutiqueService
  ) {}

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
            this.loadHoraires(boutique._id);
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

  private loadHoraires(boutiqueId: string) {
    this.horaireService.getHoraireByBoutiqueId(boutiqueId).subscribe({
      next: (data) => {
        console.log('Horaires loaded:', data);
        this.horaires.set(data);
      },
      error: (err) => {
        console.error('Error loading horaires:', err);
      }
    });
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

  // Horaire methods
  openHoraireModal(horaire?: HoraireDB) {
    if (horaire) {
      this.editingHoraire.set(horaire);
      this.horaireForm.set({
        label: horaire.label,
        horaire_ouverture: horaire.horaire_ouverture,
        horaire_fermeture: horaire.horaire_fermeture
      });
    } else {
      this.editingHoraire.set(null);
      this.horaireForm.set({
        label: '',
        horaire_ouverture: '',
        horaire_fermeture: ''
      });
    }
    this.showHoraireModal.set(true);
  }

  closeHoraireModal() {
    this.showHoraireModal.set(false);
    this.editingHoraire.set(null);
    this.horaireForm.set({
      label: '',
      horaire_ouverture: '',
      horaire_fermeture: ''
    });
  }

  updateHoraireField(field: string, value: string) {
    this.horaireForm.update(data => ({ ...data, [field]: value }));
  }

  saveHoraire() {
    const form = this.horaireForm();
    if (!form.label || !form.horaire_ouverture || !form.horaire_fermeture) {
      return;
    }

    const horaireData = {
      ...form,
      id_boutique: this.boutique()?._id
    };

    if (this.editingHoraire()) {
      // Update
      this.horaireService.updateHoraire(this.editingHoraire()!._id, horaireData).subscribe({
        next: () => {
          console.log('Horaire updated');
          this.loadHoraires(this.boutique()!._id);
          this.closeHoraireModal();
        },
        error: (err) => {
          console.error('Error updating horaire:', err);
        }
      });
    } else {
      // Create
      this.horaireService.addHoraire(horaireData).subscribe({
        next: () => {
          console.log('Horaire created');
          this.loadHoraires(this.boutique()!._id);
          this.closeHoraireModal();
        },
        error: (err) => {
          console.error('Error creating horaire:', err);
        }
      });
    }
  }

  deleteHoraire(horaire: HoraireDB) {
    if (confirm(`Supprimer l'horaire "${horaire.label}" ?`)) {
      this.horaireService.deleteHoraire(horaire._id).subscribe({
        next: () => {
          console.log('Horaire deleted');
          this.loadHoraires(this.boutique()!._id);
        },
        error: (err) => {
          console.error('Error deleting horaire:', err);
        }
      });
    }
  }
}
