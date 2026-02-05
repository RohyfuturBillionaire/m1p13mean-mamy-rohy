import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { DataService } from '../../core/services/data.service';
import { Contrat, User } from '../../core/models/admin.model';
import { Boutique } from '../../core/models/boutique.model';

@Component({
  selector: 'app-boutiques-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './boutiques.component.html',
  styleUrl: './boutiques.component.scss'
})
export class BoutiquesAdminComponent implements OnInit {
  contrats = signal<Contrat[]>([]);
  boutiques = signal<Boutique[]>([]);
  users = signal<User[]>([]);

  showContratModal = signal(false);
  showPdfPreview = signal(false);

  newContrat: Partial<Contrat> = {
    nomClient: '',
    nomEntreprise: '',
    dateDebut: new Date(),
    dateFin: new Date(),
    loyerMensuel: 0,
    surface: 0,
    etage: 1,
    numero: '',
    statut: 'actif'
  };

  selectedContrat = signal<Contrat | null>(null);

  constructor(
    private adminService: AdminService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.adminService.getContrats().subscribe(c => this.contrats.set(c));
    this.dataService.getBoutiques().subscribe(b => this.boutiques.set(b));
    this.adminService.getUsers().subscribe(u => this.users.set(u.filter(user => user.role === 'boutique')));
  }

  openContratModal() {
    this.newContrat = {
      nomClient: '',
      nomEntreprise: '',
      dateDebut: new Date(),
      dateFin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      loyerMensuel: 3000000,
      surface: 50,
      etage: 1,
      numero: '',
      statut: 'actif'
    };
    this.showContratModal.set(true);
  }

  closeContratModal() {
    this.showContratModal.set(false);
  }

  saveContrat() {
    this.adminService.addContrat({
      ...this.newContrat,
      boutiqueId: 'boutique-' + Date.now(),
      clientId: 'client-' + Date.now()
    } as Omit<Contrat, 'id'>).subscribe(() => {
      this.loadData();
      this.closeContratModal();
    });
  }

  viewContratPdf(contrat: Contrat) {
    this.selectedContrat.set(contrat);
    this.showPdfPreview.set(true);
  }

  closePdfPreview() {
    this.showPdfPreview.set(false);
    this.selectedContrat.set(null);
  }

  downloadPdf() {
    // Simulation de téléchargement PDF
    const contrat = this.selectedContrat();
    if (contrat) {
      const content = this.generateContratText(contrat);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Contrat_${contrat.nomEntreprise.replace(/\s/g, '_')}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  generateContratText(contrat: Contrat): string {
    return `
═══════════════════════════════════════════════════════════════
                    CONTRAT DE LOCATION
                      TANA CENTER
═══════════════════════════════════════════════════════════════

ENTRE LES SOUSSIGNÉS :

TANA CENTER SARL, société à responsabilité limitée au capital
de 500.000.000 Ariary, dont le siège social est situé Avenue
de l'Indépendance, Antananarivo 101, Madagascar, représentée
par son Directeur Général,

Ci-après dénommée "LE BAILLEUR"

D'UNE PART,

ET :

${contrat.nomEntreprise}
Représentée par : ${contrat.nomClient}

Ci-après dénommée "LE LOCATAIRE"

D'AUTRE PART,

═══════════════════════════════════════════════════════════════
                    ARTICLE 1 - OBJET
═══════════════════════════════════════════════════════════════

Le Bailleur donne en location au Locataire, qui accepte, un
local commercial situé dans le centre commercial TANA CENTER.

DÉSIGNATION DU LOCAL :
- Numéro : ${contrat.numero}
- Étage : ${contrat.etage}${contrat.etage === 1 ? 'er' : 'ème'} étage
- Surface : ${contrat.surface} m²

═══════════════════════════════════════════════════════════════
                    ARTICLE 2 - DURÉE
═══════════════════════════════════════════════════════════════

Le présent contrat est conclu pour une durée de :
- Date de début : ${this.formatDateFull(contrat.dateDebut)}
- Date de fin : ${this.formatDateFull(contrat.dateFin)}

═══════════════════════════════════════════════════════════════
                    ARTICLE 3 - LOYER
═══════════════════════════════════════════════════════════════

Le loyer mensuel est fixé à : ${this.formatMontant(contrat.loyerMensuel)} Ariary
(${this.numberToWords(contrat.loyerMensuel)} Ariary)

Ce loyer est payable d'avance, le premier jour de chaque mois.

═══════════════════════════════════════════════════════════════
                    ARTICLE 4 - CHARGES
═══════════════════════════════════════════════════════════════

En sus du loyer, le Locataire s'acquittera des charges suivantes :
- Charges communes : 5% du loyer
- Électricité : selon consommation
- Eau : forfait inclus

═══════════════════════════════════════════════════════════════
                    SIGNATURES
═══════════════════════════════════════════════════════════════

Fait en deux exemplaires originaux,
À Antananarivo, le ${this.formatDateFull(new Date())}


LE BAILLEUR                          LE LOCATAIRE



_____________________               _____________________
TANA CENTER SARL                    ${contrat.nomEntreprise}
`;
  }

  formatMontant(montant: number): string {
    return montant.toLocaleString('fr-FR');
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatDateFull(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  numberToWords(num: number): string {
    // Simplified version
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(0)} million(s)`;
    }
    return num.toString();
  }

  getStatutClass(statut: string): string {
    return `statut-${statut}`;
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'actif': 'Actif',
      'expire': 'Expiré',
      'resilie': 'Résilié'
    };
    return labels[statut] || statut;
  }

  getDaysRemaining(dateFin: Date): number {
    const now = new Date();
    const end = new Date(dateFin);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getStats() {
    const contrats = this.contrats();
    return {
      total: contrats.length,
      actifs: contrats.filter(c => c.statut === 'actif').length,
      expirant: contrats.filter(c => this.getDaysRemaining(c.dateFin) <= 90 && this.getDaysRemaining(c.dateFin) > 0).length,
      totalLoyers: contrats.filter(c => c.statut === 'actif').reduce((sum, c) => sum + c.loyerMensuel, 0)
    };
  }
}
