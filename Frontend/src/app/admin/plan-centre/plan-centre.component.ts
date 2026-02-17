import { Component, OnInit, signal, computed, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalApiService } from '../../core/services/local-api.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-plan-centre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-centre.component.html',
  styleUrl: './plan-centre.component.scss'
})
export class PlanCentreComponent implements OnInit {
  locaux = signal<any[]>([]);
  boutiques = signal<any[]>([]);
  selectedEtage = signal(1);
  selectedLocal = signal<any | null>(null);

  // Modal state
  showModal = signal(false);
  showAddModal = signal(false);
  isSubmitting = signal(false);

  // Edit form
  editForm = signal({
    couleur: '#C9A962',
    id_boutique: '',
    numero: ''
  });

  // Add form
  addForm = signal({
    numero: '',
    etage: 1,
    x: 1,
    y: 1,
    largeur: 1,
    hauteur: 1,
    couleur: '#C9A962'
  });

  // Delete
  showDeleteModal = signal(false);
  deletingLocal = signal<any | null>(null);

  // Drag & Drop
  draggedBoutique = signal<any | null>(null);
  draggedLocal = signal<any | null>(null);
  dropTargetLocal = signal<any | null>(null);
  showBoutiqueSidebar = signal(true);

  // Visibility filter
  showMasques = signal(false);

  // Resize state
  resizingLocal = signal<any | null>(null);
  resizeStartX = 0;
  resizeStartY = 0;
  resizeStartW = 0;
  resizeStartH = 0;
  resizeDirection = '';
  private boundOnResizeMove: any;
  private boundOnResizeEnd: any;

  locauxEtage = computed(() =>
    this.locaux().filter(l => l.etage === this.selectedEtage())
  );

  locauxVisibles = computed(() => {
    const all = this.locauxEtage();
    if (this.showMasques()) return all;
    return all.filter(l => !l.masque);
  });

  stats = computed(() => {
    const all = this.locaux();
    return {
      total: all.length,
      occupes: all.filter(l => l.statut === 'OCCUPE').length,
      libres: all.filter(l => l.statut === 'LIBRE').length,
      masques: all.filter(l => l.masque).length
    };
  });

  // Unassigned boutiques (not linked to any space)
  boutiquesNonAssignees = computed(() => {
    const assignedIds = this.locaux()
      .filter(l => l.id_boutique)
      .map(l => typeof l.id_boutique === 'object' ? l.id_boutique._id : l.id_boutique);
    return this.boutiques().filter(b => !assignedIds.includes(b._id));
  });

  // Legend items derived from unique colors
  legendItems = computed(() => {
    const colorMap = new Map<string, string>();
    for (const local of this.locauxEtage()) {
      const color = local.couleur || '#C9A962';
      const label = local.id_boutique?.nom || local.numero;
      if (!colorMap.has(color)) {
        colorMap.set(color, label);
      }
    }
    return Array.from(colorMap.entries()).map(([color, label]) => ({ color, label }));
  });

  constructor(
    private localApi: LocalApiService,
    private http: HttpClient
  ) {
    this.boundOnResizeMove = this.onResizeMove.bind(this);
    this.boundOnResizeEnd = this.onResizeEnd.bind(this);
  }

  ngOnInit() {
    this.loadLocaux();
    this.loadBoutiques();
  }

  loadLocaux() {
    this.localApi.getLocaux().subscribe({
      next: (data) => this.locaux.set(data),
      error: (err) => console.error('Erreur chargement locaux:', err)
    });
  }

  loadBoutiques() {
    this.http.get<any>(`${environment.apiUrl}/api/boutiques`).subscribe({
      next: (res) => this.boutiques.set(res.data || res),
      error: (err) => console.error('Erreur chargement boutiques:', err)
    });
  }

  setEtage(etage: number) {
    this.selectedEtage.set(etage);
    this.selectedLocal.set(null);
  }

  // Click on a space → open edit modal
  onLocalClick(local: any) {
    if (this.resizingLocal()) return;
    this.selectedLocal.set(local);
    this.editForm.set({
      couleur: local.couleur || '#C9A962',
      id_boutique: local.id_boutique?._id || '',
      numero: local.numero || ''
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedLocal.set(null);
  }

  updateEditField(field: string, value: any) {
    this.editForm.update(f => ({ ...f, [field]: value }));
  }

  saveLocal() {
    const local = this.selectedLocal();
    if (!local) return;

    this.isSubmitting.set(true);
    const form = this.editForm();

    this.localApi.updateLocal(local._id, {
      couleur: form.couleur,
      numero: form.numero,
      etage: local.etage,
      x: local.x,
      y: local.y,
      largeur: local.largeur,
      hauteur: local.hauteur
    }).subscribe({
      next: () => {
        this.localApi.assignBoutique(local._id, form.id_boutique || null).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.closeModal();
            this.loadLocaux();
          },
          error: () => {
            this.isSubmitting.set(false);
            this.loadLocaux();
            this.closeModal();
          }
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Erreur mise à jour:', err);
      }
    });
  }

  // Add new space
  openAddModal() {
    this.addForm.set({
      numero: '',
      etage: this.selectedEtage(),
      x: 1,
      y: 1,
      largeur: 1,
      hauteur: 1,
      couleur: '#C9A962'
    });
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  updateAddField(field: string, value: any) {
    this.addForm.update(f => ({ ...f, [field]: value }));
  }

  createLocal() {
    const data = this.addForm();
    if (!data.numero) return;

    this.isSubmitting.set(true);
    this.localApi.createLocal(data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeAddModal();
        this.loadLocaux();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Erreur création:', err);
      }
    });
  }

  // Delete
  confirmDelete(local: any, event: Event) {
    event.stopPropagation();
    this.deletingLocal.set(local);
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.deletingLocal.set(null);
  }

  deleteLocal() {
    const local = this.deletingLocal();
    if (!local) return;

    this.localApi.deleteLocal(local._id).subscribe({
      next: () => {
        this.cancelDelete();
        this.closeModal();
        this.loadLocaux();
      },
      error: (err) => console.error('Erreur suppression:', err)
    });
  }

  // --- Drag & Drop (boutiques → spaces) ---

  onBoutiqueDragStart(boutique: any, event: DragEvent) {
    this.draggedBoutique.set(boutique);
    this.draggedLocal.set(null);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', boutique._id);
    }
  }

  onBoutiqueDragEnd() {
    this.draggedBoutique.set(null);
    this.dropTargetLocal.set(null);
  }

  onSpaceDragOver(local: any, event: DragEvent) {
    const draggedBoutique = this.draggedBoutique();
    const draggedLocal = this.draggedLocal();

    if (draggedBoutique && local.statut === 'LIBRE') {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      this.dropTargetLocal.set(local);
    } else if (draggedLocal && draggedLocal._id !== local._id) {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      this.dropTargetLocal.set(local);
    }
  }

  onSpaceDragLeave(local: any, event: DragEvent) {
    if (this.dropTargetLocal()?._id === local._id) {
      this.dropTargetLocal.set(null);
    }
  }

  onSpaceDrop(local: any, event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dropTargetLocal.set(null);

    const boutique = this.draggedBoutique();
    const draggedLocal = this.draggedLocal();

    // Case 1: Dropping a boutique onto a LIBRE space
    if (boutique && local.statut === 'LIBRE') {
      this.draggedBoutique.set(null);
      this.isSubmitting.set(true);
      this.localApi.assignBoutique(local._id, boutique._id).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.loadLocaux();
          this.loadBoutiques();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          console.error('Erreur assignation:', err);
        }
      });
      return;
    }

    // Case 2: Dropping a space onto another space → swap positions
    if (draggedLocal && draggedLocal._id !== local._id) {
      this.draggedLocal.set(null);
      this.isSubmitting.set(true);
      this.localApi.swapPositions(draggedLocal._id, local._id).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.loadLocaux();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          console.error('Erreur swap:', err);
        }
      });
    }
  }

  unassignBoutique(local: any, event: Event) {
    event.stopPropagation();
    if (!local.id_boutique) return;

    this.isSubmitting.set(true);
    this.localApi.assignBoutique(local._id, null).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.loadLocaux();
        this.loadBoutiques();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Erreur désassignation:', err);
      }
    });
  }

  toggleBoutiqueSidebar() {
    this.showBoutiqueSidebar.update(v => !v);
  }

  // --- Drag & Drop spaces (repositioning) ---

  onLocalDragStart(local: any, event: DragEvent) {
    if (this.resizingLocal()) {
      event.preventDefault();
      return;
    }
    this.draggedLocal.set(local);
    this.draggedBoutique.set(null);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', local._id);
    }
  }

  onLocalDragEnd() {
    this.draggedLocal.set(null);
    this.dropTargetLocal.set(null);
  }

  // --- Resize ---

  onResizeStart(local: any, direction: string, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.resizingLocal.set(local);
    this.resizeDirection = direction;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.resizeStartW = local.largeur || 1;
    this.resizeStartH = local.hauteur || 1;

    document.addEventListener('mousemove', this.boundOnResizeMove);
    document.addEventListener('mouseup', this.boundOnResizeEnd);
  }

  onResizeMove(event: MouseEvent) {
    const local = this.resizingLocal();
    if (!local) return;

    const dx = event.clientX - this.resizeStartX;
    const dy = event.clientY - this.resizeStartY;
    const stepX = 90; // approximate width per grid unit
    const stepY = 70; // approximate height per grid unit

    let newW = this.resizeStartW;
    let newH = this.resizeStartH;

    if (this.resizeDirection.includes('e')) {
      newW = Math.max(1, this.resizeStartW + Math.round(dx / stepX));
    }
    if (this.resizeDirection.includes('s')) {
      newH = Math.max(1, this.resizeStartH + Math.round(dy / stepY));
    }

    // Cap at reasonable max
    newW = Math.min(newW, 6);
    newH = Math.min(newH, 4);

    if (newW !== local.largeur || newH !== local.hauteur) {
      // Optimistic local update for responsive feel
      this.locaux.update(list =>
        list.map(l => l._id === local._id ? { ...l, largeur: newW, hauteur: newH } : l)
      );
    }
  }

  onResizeEnd(event: MouseEvent) {
    document.removeEventListener('mousemove', this.boundOnResizeMove);
    document.removeEventListener('mouseup', this.boundOnResizeEnd);

    const local = this.resizingLocal();
    if (!local) return;

    // Get the updated values from the signal
    const updated = this.locaux().find(l => l._id === local._id);
    if (!updated) {
      this.resizingLocal.set(null);
      return;
    }

    const newW = updated.largeur;
    const newH = updated.hauteur;

    // Only save if changed
    if (newW !== this.resizeStartW || newH !== this.resizeStartH) {
      this.localApi.updateLocal(local._id, {
        numero: updated.numero,
        etage: updated.etage,
        x: updated.x,
        y: updated.y,
        largeur: newW,
        hauteur: newH,
        couleur: updated.couleur
      }).subscribe({
        next: () => this.loadLocaux(),
        error: (err) => {
          console.error('Erreur resize:', err);
          this.loadLocaux(); // revert on error
        }
      });
    }

    // Small delay to prevent click event from firing after resize
    setTimeout(() => this.resizingLocal.set(null), 100);
  }

  // --- Visibility toggle ---

  toggleMasque(local: any, event: Event) {
    event.stopPropagation();
    const newVal = !local.masque;

    // Optimistic update
    this.locaux.update(list =>
      list.map(l => l._id === local._id ? { ...l, masque: newVal } : l)
    );

    this.localApi.toggleMasque(local._id, newVal).subscribe({
      next: () => this.loadLocaux(),
      error: (err) => {
        console.error('Erreur toggle masque:', err);
        this.loadLocaux();
      }
    });
  }

  toggleShowMasques() {
    this.showMasques.update(v => !v);
  }
}
