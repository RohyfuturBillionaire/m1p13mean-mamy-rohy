import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/admin.model';
import { UsersService } from './services/users.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent implements OnInit {
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  searchQuery = signal('');
  roleFilter = signal('all');
  showModal = signal(false);
  editMode = signal(false);
  showDeleteConfirm = signal(false);
  userToDelete = signal<User | null>(null);

  currentUser: Partial<User> = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'client',
    actif: true
  };

  constructor(private adminService: AdminService,private usersService: UsersService) {}

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.usersService.getUsers().subscribe(users => {
      // this.users.set(users);
      // this.applyFilters();
      console.log('Fetched users:', users);
    });
    this.adminService.getUsers().subscribe(users => {
      this.users.set(users);
      this.applyFilters();
    });
  }

  applyFilters() {
    let filtered = [...this.users()];

    // Search filter
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(u =>
        u.nom.toLowerCase().includes(query) ||
        u.prenom.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (this.roleFilter() !== 'all') {
      filtered = filtered.filter(u => u.role === this.roleFilter());
    }

    this.filteredUsers.set(filtered);
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.applyFilters();
  }

  onRoleFilterChange(role: string) {
    this.roleFilter.set(role);
    this.applyFilters();
  }

  openAddModal() {
    this.editMode.set(false);
    this.currentUser = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      role: 'client',
      actif: true
    };
    this.showModal.set(true);
  }

  openEditModal(user: User) {
    this.editMode.set(true);
    this.currentUser = { ...user };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveUser() {
    if (this.editMode() && this.currentUser.id) {
      this.adminService.updateUser(this.currentUser.id, this.currentUser).subscribe(() => {
        this.loadUsers();
        this.closeModal();
      });
    } else {
      this.adminService.addUser(this.currentUser as Omit<User, 'id' | 'dateInscription'>).subscribe(() => {
        this.loadUsers();
        this.closeModal();
      });
    }
  }

  confirmDelete(user: User) {
    this.userToDelete.set(user);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete() {
    this.userToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  deleteUser() {
    const user = this.userToDelete();
    if (user) {
      this.adminService.deleteUser(user.id).subscribe(() => {
        this.loadUsers();
        this.cancelDelete();
      });
    }
  }

  toggleUserStatus(user: User) {
    this.adminService.updateUser(user.id, { actif: !user.actif }).subscribe(() => {
      this.loadUsers();
    });
  }

  changeUserRole(user: User, newRole: 'admin' | 'boutique' | 'client') {
    this.adminService.updateUser(user.id, { role: newRole }).subscribe(() => {
      this.loadUsers();
    });
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'admin': 'Administrateur',
      'boutique': 'Boutique',
      'client': 'Client'
    };
    return labels[role] || role;
  }

  getRoleClass(role: string): string {
    return `role-${role}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getStats() {
    const users = this.users();
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      boutiques: users.filter(u => u.role === 'boutique').length,
      clients: users.filter(u => u.role === 'client').length,
      actifs: users.filter(u => u.actif).length
    };
  }
}
