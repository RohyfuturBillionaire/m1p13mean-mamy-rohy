import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoutiqueApiService, BoutiqueApi } from '../../core/services/boutique-api.service';
import { UserApiService, UserApi } from '../../core/services/user-api.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-association-boutiques',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './association-boutiques.component.html',
  styleUrl: './association-boutiques.component.scss'
})
export class AssociationBoutiquesComponent implements OnInit {
  users = signal<UserApi[]>([]);
  boutiques = signal<BoutiqueApi[]>([]);
  searchTerm = signal('');

  showAssignModal = signal(false);
  selectedUser = signal<UserApi | null>(null);
  selectedBoutiqueId = signal<string>('');
  saving = signal(false);

  private searchSubject = new Subject<string>();

  constructor(
    private boutiqueApi: BoutiqueApiService,
    private userApi: UserApiService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadUnassignedBoutiques();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.loadUsers(term);
    });
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  private loadUsers(search?: string) {
    const params: any = { role: 'boutique' };
    if (search) params.search = search;
    this.userApi.getAll(params).subscribe(users => {
      this.users.set(users);
    });
  }

  private loadUnassignedBoutiques() {
    this.boutiqueApi.getAll().subscribe(boutiques => {
      this.boutiques.set(boutiques);
    });
  }

  getUnassignedBoutiques(): BoutiqueApi[] {
    return this.boutiques().filter(b => !b.user_proprietaire);
  }

  hasBoutique(user: UserApi): boolean {
    return !!user.boutique;
  }

  openAssignModal(user: UserApi) {
    this.selectedUser.set(user);
    this.selectedBoutiqueId.set('');
    this.showAssignModal.set(true);
  }

  closeAssignModal() {
    this.showAssignModal.set(false);
    this.selectedUser.set(null);
    this.selectedBoutiqueId.set('');
  }

  assignUser() {
    const user = this.selectedUser();
    const boutiqueId = this.selectedBoutiqueId();
    if (!user || !boutiqueId) return;

    this.saving.set(true);
    this.boutiqueApi.assignUser(boutiqueId, user._id).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeAssignModal();
        this.loadUsers(this.searchTerm());
        this.loadUnassignedBoutiques();
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }

  unassignUser(user: UserApi) {
    if (!user.boutique) return;
    this.boutiqueApi.assignUser(user.boutique.boutiqueId, null).subscribe(() => {
      this.loadUsers(this.searchTerm());
      this.loadUnassignedBoutiques();
    });
  }

  getStats() {
    const list = this.users();
    return {
      total: list.length,
      assigned: list.filter(u => this.hasBoutique(u)).length,
      unassigned: list.filter(u => !this.hasBoutique(u)).length
    };
  }
}
