import { Component, OnInit, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { Boutique, Categorie } from '../../core/models/boutique.model';

@Component({
  selector: 'app-boutiques',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './boutiques.component.html',
  styleUrl: './boutiques.component.scss'
})
export class BoutiquesComponent implements OnInit {
  allBoutiques = signal<Boutique[]>([]);
  categories = signal<Categorie[]>([]);

  searchQuery = signal('');
  selectedCategorie = signal<string>('all');
  selectedType = signal<string>('all');
  selectedEtage = signal<number | null>(null);

  isFilterSticky = signal(false);

  @HostListener('window:scroll')
  onWindowScroll() {
    const heroHeight = 300;
    this.isFilterSticky.set(window.scrollY > heroHeight);
  }

  filteredBoutiques = computed(() => {
    let boutiques = this.allBoutiques();
    const query = this.searchQuery().toLowerCase();
    const categorie = this.selectedCategorie();
    const type = this.selectedType();
    const etage = this.selectedEtage();

    if (query) {
      boutiques = boutiques.filter(b =>
        b.nom.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query) ||
        b.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    if (categorie !== 'all') {
      boutiques = boutiques.filter(b => b.categorie === categorie);
    }

    if (type !== 'all') {
      boutiques = boutiques.filter(b => b.type === type);
    }

    if (etage !== null) {
      boutiques = boutiques.filter(b => b.etage === etage);
    }

    return boutiques;
  });

  boutiqueCount = computed(() => this.filteredBoutiques().length);

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadData();
    this.route.queryParams.subscribe(params => {
      if (params['categorie']) {
        this.selectedCategorie.set(params['categorie']);
      }
      if (params['type']) {
        this.selectedType.set(params['type']);
      }
    });
  }

  private loadData() {
    this.dataService.getBoutiques().subscribe(boutiques => {
      this.allBoutiques.set(boutiques);
    });

    this.dataService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  setCategorie(categorie: string) {
    this.selectedCategorie.set(categorie);
  }

  setType(type: string) {
    this.selectedType.set(type);
  }

  setEtage(etage: number | null) {
    this.selectedEtage.set(etage);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedCategorie.set('all');
    this.selectedType.set('all');
    this.selectedEtage.set(null);
  }

  hasActiveFilters(): boolean {
    return this.searchQuery() !== '' ||
           this.selectedCategorie() !== 'all' ||
           this.selectedType() !== 'all' ||
           this.selectedEtage() !== null;
  }
}
