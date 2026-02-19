import { Component, OnInit, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BoutiqueApiService, BoutiqueApi, CategoryApi } from '../../core/services/boutique-api.service';

@Component({
  selector: 'app-boutiques',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './boutiques.component.html',
  styleUrl: './boutiques.component.scss'
})
export class BoutiquesComponent implements OnInit {
  allBoutiques = signal<BoutiqueApi[]>([]);
  categories = signal<CategoryApi[]>([]);

  searchQuery = signal('');
  selectedCategorie = signal<string>('all');
  selectedType = signal<string>('all');

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

    if (query) {
      boutiques = boutiques.filter(b =>
        b.nom.toLowerCase().includes(query) ||
        (b.description || '').toLowerCase().includes(query)
      );
    }

    if (categorie !== 'all') {
      boutiques = boutiques.filter(b => b.id_categorie?._id === categorie);
    }

    if (type !== 'all') {
      boutiques = boutiques.filter(b => b.type_boutique === type);
    }

    return boutiques;
  });

  boutiqueCount = computed(() => this.filteredBoutiques().length);

  constructor(
    private boutiqueApi: BoutiqueApiService,
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
    this.boutiqueApi.getAll({ status: true }).subscribe(boutiques => {
      this.allBoutiques.set(boutiques);
    });

    this.boutiqueApi.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }

  getLogoUrl(boutique: BoutiqueApi): string {
    if (!boutique.logo) return 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800';
    if (boutique.logo.startsWith('http')) return boutique.logo;
    return 'http://localhost:5000' + boutique.logo;
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

  clearFilters() {
    this.searchQuery.set('');
    this.selectedCategorie.set('all');
    this.selectedType.set('all');
  }

  hasActiveFilters(): boolean {
    return this.searchQuery() !== '' ||
           this.selectedCategorie() !== 'all' ||
           this.selectedType() !== 'all';
  }
}
