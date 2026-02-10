import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContractService, ContractType } from '../../core/services/contract.service';

@Component({
  selector: 'app-types-contrat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './types-contrat.component.html',
  styleUrl: './types-contrat.component.scss'
})
export class TypesContratComponent implements OnInit {
  types = signal<ContractType[]>([]);
  showModal = signal(false);
  editingType = signal<ContractType | null>(null);
  formName = '';

  constructor(private contractService: ContractService) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.contractService.getContractTypes().subscribe(t => this.types.set(t));
  }

  openModal(type?: ContractType) {
    if (type) {
      this.editingType.set(type);
      this.formName = type.contract_type_name;
    } else {
      this.editingType.set(null);
      this.formName = '';
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingType.set(null);
    this.formName = '';
  }

  save() {
    if (!this.formName.trim()) return;

    const editing = this.editingType();
    if (editing) {
      this.contractService.updateContractType(editing._id, { contract_type_name: this.formName.trim() }).subscribe(() => {
        this.loadData();
        this.closeModal();
      });
    } else {
      this.contractService.createContractType({ contract_type_name: this.formName.trim() }).subscribe(() => {
        this.loadData();
        this.closeModal();
      });
    }
  }

  deleteType(type: ContractType) {
    if (confirm(`Supprimer le type "${type.contract_type_name}" ?`)) {
      this.contractService.deleteContractType(type._id).subscribe(() => this.loadData());
    }
  }
}
