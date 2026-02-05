import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { Boutique, Categorie } from '../../core/models/boutique.model';

interface MapPosition {
  row: number;
  col: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit {
  boutiques = signal<Boutique[]>([]);
  categories = signal<Categorie[]>([]);
  selectedEtage = signal(1);
  selectedBoutique = signal<Boutique | null>(null);
  searchQuery = signal('');
  selectedCategorie = signal<string>('all');
  hoveredBoutique = signal<string | null>(null);

  // Positions prédéfinies pour les boutiques sur la grille (étage 1)
  mapPositionsEtage1: { [key: string]: MapPosition } = {
    'elegance-paris': { row: 1, col: 1, width: 2, height: 1 },
    'gentleman-store': { row: 1, col: 3, width: 1, height: 1 },
    'beaute-divine': { row: 1, col: 4, width: 1, height: 1 },
    'parfums-orient': { row: 1, col: 5, width: 1, height: 2 },
    'or-diamant': { row: 2, col: 1, width: 1, height: 1 },
    'cafe-imperial': { row: 2, col: 2, width: 1, height: 1 },
    'banque-premiere': { row: 2, col: 3, width: 2, height: 1 },
    'tech-premium': { row: 3, col: 1, width: 1, height: 1 },
  };

  // Positions pour l'étage 2
  mapPositionsEtage2: { [key: string]: MapPosition } = {
    'urban-style': { row: 1, col: 1, width: 1, height: 1 },
    'la-terrasse': { row: 1, col: 2, width: 2, height: 1 },
    'sakura-sushi': { row: 1, col: 4, width: 1, height: 1 },
    'art-interieur': { row: 2, col: 1, width: 2, height: 1 },
    'sport-elite': { row: 2, col: 3, width: 1, height: 1 },
  };

  boutiquesEtage = computed(() => {
    let filtered = this.boutiques().filter(b => b.etage === this.selectedEtage());

    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(b =>
        b.nom.toLowerCase().includes(query) ||
        b.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    if (this.selectedCategorie() !== 'all') {
      filtered = filtered.filter(b => b.categorie === this.selectedCategorie());
    }

    return filtered;
  });

  // Couleurs par catégorie (style similaire à l'exemple)
  categoryColors: { [key: string]: string } = {
    'mode': '#C41E3A',           // Rouge foncé
    'beaute': '#E75480',         // Rose
    'bijouterie': '#C9A962',     // Or
    'electronique': '#D4A5A5',   // Rose clair
    'maison': '#8B4513',         // Marron
    'restauration': '#722F37',   // Bordeaux
    'sport': '#DC143C',          // Rouge crimson
    'services': '#A9A9A9',       // Gris
  };

  constructor(
    private dataService: DataService,
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
    this.dataService.getBoutiques().subscribe(boutiques => {
      this.boutiques.set(boutiques);
    });

    this.dataService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }

  private highlightBoutique(boutiqueId: string) {
    const boutique = this.boutiques().find(b => b.id === boutiqueId);
    if (boutique) {
      this.selectedEtage.set(boutique.etage);
      this.selectedBoutique.set(boutique);
    }
  }

  setEtage(etage: number) {
    this.selectedEtage.set(etage);
    this.selectedBoutique.set(null);
  }

  selectBoutique(boutique: Boutique) {
    this.selectedBoutique.set(boutique);
  }

  closeBoutiqueInfo() {
    this.selectedBoutique.set(null);
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  setCategorie(categorie: string) {
    this.selectedCategorie.set(categorie);
  }

  setHoveredBoutique(id: string | null) {
    this.hoveredBoutique.set(id);
  }

  getMapPosition(boutique: Boutique): MapPosition {
    const positions = this.selectedEtage() === 1 ? this.mapPositionsEtage1 : this.mapPositionsEtage2;
    return positions[boutique.id] || { row: 1, col: 1, width: 1, height: 1 };
  }

  getBoutiqueGridStyle(boutique: Boutique) {
    const pos = this.getMapPosition(boutique);
    return {
      'grid-row': `${pos.row} / span ${pos.height}`,
      'grid-column': `${pos.col} / span ${pos.width}`
    };
  }

  getBoutiqueColor(boutique: Boutique): string {
    return this.categoryColors[boutique.categorie] || '#C9A962';
  }

  getCategorieLabel(categorieId: string): string {
    const cat = this.categories().find(c => c.id === categorieId);
    return cat ? cat.nom : categorieId;
  }

  // Légende des couleurs
  legendItems = [
    { label: 'Mode', color: '#C41E3A' },
    { label: 'Beauté', color: '#E75480' },
    { label: 'Bijouterie', color: '#C9A962' },
    { label: 'Restauration', color: '#722F37' },
    { label: 'Services', color: '#A9A9A9' },
    { label: 'High-Tech', color: '#D4A5A5' },
  ];
}
