import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../../core/services/seller.service';
import { SellerProduit } from '../../core/models/seller.model';

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produits.component.html',
  styleUrl: './produits.component.scss'
})
export class ProduitsComponent implements OnInit {
  produits = signal<SellerProduit[]>([]);
  filteredProduits = signal<SellerProduit[]>([]);

  // Filters
  searchQuery = signal('');
  statusFilter = signal<string>('all');
  categoryFilter = signal<string>('all');

  // Modal
  showModal = signal(false);
  editingProduit = signal<SellerProduit | null>(null);
  isSubmitting = signal(false);

  // Form data
  formData = signal({
    nom: '',
    description: '',
    prix: 0,
    prixPromo: null as number | null,
    categorie: '',
    stock: 0,
    stockAlerte: 5,
    image: '',
    statut: 'actif' as 'actif' | 'inactif' | 'rupture'
  });

  // Delete confirmation
  showDeleteModal = signal(false);
  deletingProduit = signal<SellerProduit | null>(null);

  categories = computed(() => {
    const cats = [...new Set(this.produits().map(p => p.categorie))];
    return cats.sort();
  });

  stats = computed(() => {
    const prods = this.produits();
    return {
      total: prods.length,
      actifs: prods.filter(p => p.statut === 'actif').length,
      rupture: prods.filter(p => p.statut === 'rupture' || p.stock === 0).length,
      alerteStock: prods.filter(p => p.stock > 0 && p.stock <= p.stockAlerte).length
    };
  });

  constructor(private sellerService: SellerService) {}

  ngOnInit() {
    this.loadProduits();
  }

  loadProduits() {
    this.sellerService.getProduits().subscribe(produits => {
      this.produits.set(produits);
      this.applyFilters();
    });
  }

  applyFilters() {
    let filtered = [...this.produits()];

    // Search filter
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(p =>
        p.nom.toLowerCase().includes(query) ||
        p.categorie.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Status filter
    const status = this.statusFilter();
    if (status !== 'all') {
      if (status === 'rupture') {
        filtered = filtered.filter(p => p.statut === 'rupture' || p.stock === 0);
      } else if (status === 'alerte') {
        filtered = filtered.filter(p => p.stock > 0 && p.stock <= p.stockAlerte);
      } else {
        filtered = filtered.filter(p => p.statut === status);
      }
    }

    // Category filter
    const cat = this.categoryFilter();
    if (cat !== 'all') {
      filtered = filtered.filter(p => p.categorie === cat);
    }

    this.filteredProduits.set(filtered);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.applyFilters();
  }

  onStatusFilter(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(value);
    this.applyFilters();
  }

  onCategoryFilter(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.categoryFilter.set(value);
    this.applyFilters();
  }

  openAddModal() {
    this.editingProduit.set(null);
    this.formData.set({
      nom: '',
      description: '',
      prix: 0,
      prixPromo: null,
      categorie: '',
      stock: 0,
      stockAlerte: 5,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      statut: 'actif'
    });
    this.showModal.set(true);
  }

  openEditModal(produit: SellerProduit) {
    this.editingProduit.set(produit);
    this.formData.set({
      nom: produit.nom,
      description: produit.description,
      prix: produit.prix,
      prixPromo: produit.prixPromo || null,
      categorie: produit.categorie,
      stock: produit.stock,
      stockAlerte: produit.stockAlerte,
      image: produit.image,
      statut: produit.statut
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProduit.set(null);
  }

  updateFormField(field: string, value: any) {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  submitForm() {
    const data = this.formData();

    if (!data.nom || !data.categorie || data.prix <= 0) {
      return;
    }

    this.isSubmitting.set(true);

    const produitData = {
      ...data,
      boutiqueId: 'b1',
      prixPromo: data.prixPromo || undefined
    };

    const editing = this.editingProduit();

    if (editing) {
      this.sellerService.updateProduit(editing.id, produitData).subscribe(() => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.loadProduits();
      });
    } else {
      this.sellerService.addProduit(produitData as any).subscribe(() => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.loadProduits();
      });
    }
  }

  toggleStatus(produit: SellerProduit) {
    this.sellerService.toggleProduitStatus(produit.id).subscribe(() => {
      this.loadProduits();
    });
  }

  confirmDelete(produit: SellerProduit) {
    this.deletingProduit.set(produit);
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.deletingProduit.set(null);
  }

  deleteProduct() {
    const produit = this.deletingProduit();
    if (produit) {
      this.sellerService.deleteProduit(produit.id).subscribe(() => {
        this.cancelDelete();
        this.loadProduits();
      });
    }
  }

  formatPrix(prix: number): string {
    return this.sellerService.formatPrix(prix);
  }

  getStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      'actif': 'Actif',
      'inactif': 'Inactif',
      'rupture': 'Rupture'
    };
    return labels[statut] || statut;
  }

  getStatusClass(produit: SellerProduit): string {
    if (produit.stock === 0) return 'rupture';
    if (produit.stock <= produit.stockAlerte) return 'alerte';
    return produit.statut;
  }
}
