import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HoraireService, HoraireBoutique } from '../../core/services/horaire.service';
import { BoutiqueApiService, BoutiqueApi } from '../../core/services/boutique-api.service';

export interface BoutiqueWithHoraires {
  boutique: BoutiqueApi;
  horaires: HoraireBoutique[];
}

@Component({
  selector: 'app-horaires',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './horaires.component.html',
  styleUrl: './horaires.component.scss'
})
export class HorairesComponent implements OnInit {
  horaires = signal<HoraireBoutique[]>([]);
  boutiques = signal<BoutiqueApi[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');

  /** Group horaires by boutique id, merge with boutique info */
  boutiqueGroups = computed<BoutiqueWithHoraires[]>(() => {
    const horairesMap = new Map<string, HoraireBoutique[]>();
    for (const h of this.horaires()) {
      const key = h.id_boutique;
      if (!horairesMap.has(key)) horairesMap.set(key, []);
      horairesMap.get(key)!.push(h);
    }

    const boutiqueMap = new Map(this.boutiques().map(b => [b._id, b]));
    const groups: BoutiqueWithHoraires[] = [];

    for (const [boutiqueId, bHoraires] of horairesMap.entries()) {
      const boutique = boutiqueMap.get(boutiqueId);
      if (boutique) {
        groups.push({ boutique, horaires: bHoraires });
      }
    }

    return groups.sort((a, b) => a.boutique.nom.localeCompare(b.boutique.nom));
  });

  filteredGroups = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.boutiqueGroups();
    return this.boutiqueGroups().filter(g =>
      g.boutique.nom.toLowerCase().includes(q) ||
      g.horaires.some(h => h.label.toLowerCase().includes(q))
    );
  });

  constructor(
    private horaireService: HoraireService,
    private boutiqueService: BoutiqueApiService
  ) {}

  ngOnInit(): void {
    forkJoin({
      horaires: this.horaireService.getAll(),
      boutiques: this.boutiqueService.getAll({ status: true })
    }).subscribe({
      next: ({ horaires, boutiques }) => {
        this.horaires.set(horaires);
        this.boutiques.set(boutiques);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  formatTime(time: string): string {
    // Normalise "09:00" or "9h00" → "09h00"
    return time.replace(':', 'h');
  }
}
