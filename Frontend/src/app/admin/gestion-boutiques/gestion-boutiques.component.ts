import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BoutiqueApiService, BoutiqueApi, CategoryApi } from '../../core/services/boutique-api.service';
import { ContractService } from '../../core/services/contract.service';
import { environment } from '../../../environments/environments';
import { LocalService, Local } from '../../core/services/local.service';

@Component({
  selector: 'app-gestion-boutiques',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-boutiques.component.html',
  styleUrl: './gestion-boutiques.component.scss'
})
export class GestionBoutiquesComponent implements OnInit {
  boutiques = signal<BoutiqueApi[]>([]);
  categories = signal<CategoryApi[]>([]);
  availableLocals = signal<Local[]>([]);

  showModal = signal(false);
  editingBoutique = signal<BoutiqueApi | null>(null);
  selectedLogoFile: File | null = null;
  logoPreview: string | null = null;

  form: any = this.getEmptyForm();
  private pendingContratId: string | null = null;

  constructor(
    private boutiqueService: BoutiqueApiService,
    private contractService: ContractService,
    private localService: LocalService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadData();

    this.route.queryParams.subscribe(params => {
      if (params['fromContract'] === 'true') {
        this.form = this.getEmptyForm();
        if (params['loyer']) {
          this.form.loyer = Number(params['loyer']);
        }
        if (params['contratId']) {
          this.pendingContratId = params['contratId'];
        }
        this.showModal.set(true);
      }
    });
  }

  private getEmptyForm() {
    return {
      nom: '',
      email: '',
      reseau: '',
      horaire_ouvert: '08:00 - 20:00',
      description: '',
      type_boutique: '',
      loyer: 0,
      id_categorie: '',
      local_boutique: '',
      status: true
    };
  }

  private loadData() {
    this.boutiqueService.getAll().subscribe(b => this.boutiques.set(b));
    this.boutiqueService.getCategories().subscribe(c => this.categories.set(c));
    this.localService.getAvailable().subscribe(l => this.availableLocals.set(l));
  }

  openModal(boutique?: BoutiqueApi) {
    // Reload available locals
    this.localService.getAvailable().subscribe(availables => {
      let locals = [...availables];
      
      if (boutique) {
        this.editingBoutique.set(boutique);
        const currentLocal = (boutique as any).local_boutique;
        
        // Add current local to list if it exists and isn't already in availables
        if (currentLocal && currentLocal._id) {
          const exists = locals.some(l => l._id === currentLocal._id);
          if (!exists) {
            locals.unshift(currentLocal);
          }
        }
        
        this.form = {
          nom: boutique.nom,
          email: boutique.email || '',
          reseau: boutique.reseau || '',
          horaire_ouvert: boutique.horaire_ouvert || '08:00 - 20:00',
          description: boutique.description || '',
          type_boutique: boutique.type_boutique || '',
          loyer: boutique.loyer || 0,
          id_categorie: boutique.id_categorie?._id || '',
          local_boutique: currentLocal?._id || '',
          status: boutique.status
        };
        this.logoPreview = boutique.logo ? environment.apiUrl + boutique.logo : null;
      } else {
        this.editingBoutique.set(null);
        this.form = this.getEmptyForm();
        this.logoPreview = null;
      }
      
      this.availableLocals.set(locals);
      this.selectedLogoFile = null;
      this.showModal.set(true);
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.editingBoutique.set(null);
    this.selectedLogoFile = null;
    this.logoPreview = null;
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedLogoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedLogoFile);
    }
  }

  saveBoutique() {
    const formData = new FormData();
    formData.append('nom', this.form.nom);
    formData.append('email', this.form.email);
    formData.append('reseau', this.form.reseau);
    formData.append('horaire_ouvert', this.form.horaire_ouvert);
    formData.append('description', this.form.description);
    formData.append('type_boutique', this.form.type_boutique);
    formData.append('loyer', String(this.form.loyer));
    formData.append('status', String(this.form.status));
    if (this.form.id_categorie) {
      formData.append('id_categorie', this.form.id_categorie);
    }
    if (this.form.local_boutique) {
      formData.append('local_boutique', this.form.local_boutique);
    }
    if (this.selectedLogoFile) {
      formData.append('logo', this.selectedLogoFile);
    }

    const editing = this.editingBoutique();
    if (editing) {
      this.boutiqueService.update(editing._id, formData).subscribe(() => {
        this.loadData();
        this.closeModal();
      });
    } else {
      this.boutiqueService.create(formData).subscribe(created => {
        if (this.pendingContratId && created?._id) {
          this.contractService.updateContract(this.pendingContratId, { id_boutique: created._id }).subscribe({
            next: () => {
              this.pendingContratId = null;
              this.loadData();
              this.closeModal();
            },
            error: () => {
              this.loadData();
              this.closeModal();
            }
          });
        } else {
          this.loadData();
          this.closeModal();
        }
      });
    }
  }

  deleteBoutique(boutique: BoutiqueApi) {
    if (confirm(`Desactiver la boutique "${boutique.nom}" ?`)) {
      this.boutiqueService.delete(boutique._id).subscribe(() => this.loadData());
    }
  }

  toggleStatus(boutique: BoutiqueApi) {
    const formData = new FormData();
    formData.append('status', String(!boutique.status));
    this.boutiqueService.update(boutique._id, formData).subscribe(() => this.loadData());
  }

  getLogoUrl(boutique: BoutiqueApi): string {
    if (!boutique.logo) return '';
    if (boutique.logo.startsWith('http')) return boutique.logo;
    return environment.apiUrl + boutique.logo;
  }

  getCategoryName(boutique: BoutiqueApi): string {
    return boutique.id_categorie?.nom || 'Non categorisee';
  }

  formatMontant(montant: number): string {
    return (montant || 0).toLocaleString('fr-FR');
  }

  getStats() {
    const list = this.boutiques();
    return {
      total: list.length,
      actives: list.filter(b => b.status).length,
      inactives: list.filter(b => !b.status).length,
      totalLoyers: list.filter(b => b.status).reduce((sum, b) => sum + (b.loyer || 0), 0)
    };
  }
}
