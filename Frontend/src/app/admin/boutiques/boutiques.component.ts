import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractService, Contract, ContractType } from '../../core/services/contract.service';

@Component({
  selector: 'app-boutiques-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './boutiques.component.html',
  styleUrl: './boutiques.component.scss'
})
export class BoutiquesAdminComponent implements OnInit {
  contrats = signal<Contract[]>([]);
  contractTypes = signal<ContractType[]>([]);

  showContratModal = signal(false);
  editingContrat = signal<Contract | null>(null);

  newContrat: any = {
    contract_type: '',
    nom_client: '',
    nom_entreprise: '',
    date_debut: '',
    date_fin: '',
    loyer: 3000000,
    surface: 50,
    etage: 1,
    numero: '',
    statut: 'actif'
  };

  constructor(
    public contractService: ContractService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.contractService.getContracts().subscribe(c => this.contrats.set(c));
    this.contractService.getContractTypes().subscribe(t => this.contractTypes.set(t));
  }

  openContratModal(contrat?: Contract) {
    if (contrat) {
      this.editingContrat.set(contrat);
      this.newContrat = {
        contract_type: contrat.contract_type?._id || '',
        nom_client: contrat.nom_client,
        nom_entreprise: contrat.nom_entreprise,
        date_debut: contrat.date_debut ? new Date(contrat.date_debut).toISOString().split('T')[0] : '',
        date_fin: contrat.date_fin ? new Date(contrat.date_fin).toISOString().split('T')[0] : '',
        loyer: contrat.loyer,
        surface: contrat.surface,
        etage: contrat.etage,
        numero: contrat.numero,
        statut: contrat.statut
      };
    } else {
      this.editingContrat.set(null);
      const now = new Date();
      const oneYearLater = new Date(now);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      this.newContrat = {
        contract_type: '',
        nom_client: '',
        nom_entreprise: '',
        date_debut: now.toISOString().split('T')[0],
        date_fin: oneYearLater.toISOString().split('T')[0],
        loyer: 3000000,
        surface: 50,
        etage: 1,
        numero: '',
        statut: 'actif'
      };
    }
    this.showContratModal.set(true);
  }

  closeContratModal() {
    this.showContratModal.set(false);
    this.editingContrat.set(null);
  }

  saveContrat() {
    const editing = this.editingContrat();
    if (editing) {
      this.contractService.updateContract(editing._id, this.newContrat).subscribe(() => {
        this.loadData();
        this.closeContratModal();
      });
    } else {
      this.contractService.createContract(this.newContrat).subscribe(contract => {
        this.loadData();
        this.closeContratModal();
        this.router.navigate(['/admin/gestion-boutiques'], {
          queryParams: { contratId: contract._id, loyer: contract.loyer, fromContract: 'true' }
        });
      });
    }
  }

  deleteContrat(contrat: Contract) {
    if (confirm(`Supprimer le contrat de ${contrat.nom_entreprise} ?`)) {
      this.contractService.deleteContract(contrat._id).subscribe(() => this.loadData());
    }
  }

  viewContratPdf(contrat: Contract) {
    this.contractService.downloadPdf(contrat._id);
  }

  formatMontant(montant: number): string {
    return montant?.toLocaleString('fr-FR') || '0';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatDateFull(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getStatutClass(statut: string): string {
    return `statut-${statut}`;
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'actif': 'Actif',
      'expire': 'Expire',
      'resilie': 'Resilie'
    };
    return labels[statut] || statut;
  }

  getDaysRemaining(dateFin: string): number {
    const now = new Date();
    const end = new Date(dateFin);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getContractTypeName(contrat: Contract): string {
    return contrat.contract_type?.contract_type_name || 'Non specifie';
  }

  getStats() {
    const contrats = this.contrats();
    return {
      total: contrats.length,
      actifs: contrats.filter(c => c.statut === 'actif').length,
      expirant: contrats.filter(c => this.getDaysRemaining(c.date_fin) <= 90 && this.getDaysRemaining(c.date_fin) > 0).length,
      totalLoyers: contrats.filter(c => c.statut === 'actif').reduce((sum, c) => sum + c.loyer, 0)
    };
  }
}
