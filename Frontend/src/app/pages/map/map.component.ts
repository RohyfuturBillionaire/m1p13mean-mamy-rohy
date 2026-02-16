import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LocalApiService } from '../../core/services/local-api.service';
import { environment } from '../../../environments/environments';

interface MapLocal {
  _id: string;
  numero: string;
  etage: number;
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
  couleur: string;
  statut: string;
  id_boutique: any | null;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit {
  locaux = signal<MapLocal[]>([]);
  selectedEtage = signal(1);
  selectedLocal = signal<MapLocal | null>(null);
  searchQuery = signal('');
  hoveredLocal = signal<string | null>(null);

  locauxEtage = computed(() => {
    let filtered = this.locaux().filter(l => l.etage === this.selectedEtage());

    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(l =>
        l.numero.toLowerCase().includes(query) ||
        (l.id_boutique?.nom || '').toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  // Available floors (derived from data)
  etages = computed(() => {
    const floors = [...new Set(this.locaux().map(l => l.etage))].sort();
    return floors.length > 0 ? floors : [1, 2];
  });

  // Build legend from unique colors used
  legendItems = computed(() => {
    const colorMap = new Map<string, string>();
    for (const l of this.locaux()) {
      if (l.statut === 'OCCUPE' && l.id_boutique) {
        colorMap.set(l.couleur, l.id_boutique.type_boutique || l.id_boutique.nom);
      }
    }
    const items: { label: string; color: string }[] = [];
    colorMap.forEach((label, color) => items.push({ label, color }));
    // Add "Libre" to legend
    items.push({ label: 'Libre', color: '#94A3B8' });
    return items;
  });

  constructor(
    private localApi: LocalApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadData();

    this.route.queryParams.subscribe(params => {
      if (params['boutique']) {
        this.highlightBoutique(params['boutique']);
      }
    });
  }

  private loadData() {
    this.localApi.getLocaux().subscribe({
      next: (locaux) => this.locaux.set(locaux),
      error: (err) => console.error('Erreur chargement locaux:', err)
    });
  }

  private highlightBoutique(boutiqueId: string) {
    const local = this.locaux().find(l => l.id_boutique?._id === boutiqueId);
    if (local) {
      this.selectedEtage.set(local.etage);
      this.selectedLocal.set(local);
    }
  }

  setEtage(etage: number) {
    this.selectedEtage.set(etage);
    this.selectedLocal.set(null);
  }

  selectLocal(local: MapLocal) {
    this.selectedLocal.set(local);
  }

  closeLocalInfo() {
    this.selectedLocal.set(null);
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  setHoveredLocal(id: string | null) {
    this.hoveredLocal.set(id);
  }

  getLocalColor(local: MapLocal): string {
    if (local.statut === 'LIBRE') return '#94A3B8';
    return local.couleur || '#C9A962';
  }

  getLocalLabel(local: MapLocal): string {
    if (local.statut === 'OCCUPE' && local.id_boutique) {
      return local.id_boutique.nom?.toUpperCase() || local.numero;
    }
    return local.numero;
  }

  isLibre(local: MapLocal): boolean {
    return local.statut === 'LIBRE';
  }

  getLogoUrl(local: MapLocal): string {
    const logo = local.id_boutique?.logo;
    if (!logo) return '';
    if (logo.startsWith('/')) return `${environment.apiUrl}${logo}`;
    return logo;
  }
}
