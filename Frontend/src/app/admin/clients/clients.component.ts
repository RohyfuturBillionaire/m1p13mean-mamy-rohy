import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { User, UserDB } from '../../core/models/admin.model';
import { UsersService } from './services/users.service';
import { RoleService } from '../../core/role_user/services/role.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent implements OnInit {
  users = signal<UserDB[]>([]);
  usersData = signal<User[]>([]);
  filteredUsers = signal<UserDB[]>([]);
  roles = signal<any[]>([]);
  searchQuery = signal('');
  roleFilter = signal('all');
  showModal = signal(false);
  editMode = signal(false);
  showDeleteConfirm = signal(false);
  userToDelete = signal<UserDB | null>(null);

  currentUser: Partial<UserDB> = {
      username: '',
      email: '',
      id_role: '',
      nom: '',
      prenom: ''
  };

  constructor(
    private adminService: AdminService,
    private usersService: UsersService,
    private roleService: RoleService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  private loadRoles() {
    this.roleService.getRoles().subscribe(roles => {
      this.roles.set(roles);
      console.log('Fetched roles:', roles);
    });
  }

  private loadUsers() {
    this.usersService.getUsers().subscribe(users => {
      this.users.set(users);
      this.applyFilters();
      console.log('Fetched users:', users);
    });
    // this.adminService.getUsers().subscribe(users => {
    //   this.users.set(users);
    //   this.applyFilters();
    // });
  }

  // Helper to get role name from id_role (handles both string and Role object)
  getRoleName(user: UserDB): string {
    if (!user.id_role) return 'admin';
    return typeof user.id_role === 'object' ? user.id_role.role_name : '';
  }

  isShop(user: UserDB): boolean {
    if (!user.id_role) return false;
    return typeof user.id_role === 'object' ? user.id_role.role_name==="boutique": false;
  }

  applyFilters() {
    let filtered = [...this.users()];

    // Search filter
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(u =>
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (this.roleFilter() !== 'all') {
      filtered = filtered.filter(u => this.getRoleName(u) === this.roleFilter());
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
      username: '',
      email: '',
      id_role: ''
    };
    this.showModal.set(true);
  }

  openEditModal(user: UserDB) {
    user.nom = user.username?.split(' ')[1] === undefined ? '' : user.username.split(' ')[1];
    user.prenom = user.username?.split(' ')[0] === undefined ? '' : user.username.split(' ')[0];
    this.editMode.set(true);
    // Extract role _id if id_role is populated object
    const roleId = typeof user.id_role === 'object' ? user.id_role._id : user.id_role;
    this.currentUser = { ...user, id_role: roleId };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveUser() {
    if (this.editMode() && this.currentUser._id) {
      this.currentUser.username = `${this.currentUser.prenom} ${this.currentUser.nom}`;
      this.usersService.updateUser(this.currentUser._id, this.currentUser).subscribe(() => {
        this.loadUsers();
        this.closeModal();
      });
    } else {
      this.usersService.addUser(this.currentUser).subscribe(() => {
        this.loadUsers();
        this.closeModal();
      });
    }
  }

  confirmDelete(user: UserDB) {
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
      this.usersService.deleteUser(user._id).subscribe(() => {
        this.loadUsers();
        this.cancelDelete();
      });
    }
  }

  // toggleUserStatus(user: UserDB) {
  //   this.adminService.updateUser(user._id, { actif: !user.actif }).subscribe(() => {
  //     this.loadUsers();
  //   });
  // }

  changeUserRole(user: UserDB, newRole: string) {
    // this.adminService.updateUser(user._id, { role: newRole }).subscribe(() => {
    //   this.loadUsers();
    // });
    this.usersService.updateUser(user._id, { id_role: newRole }).subscribe(() => {
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
    const getRoleName = (user: UserDB): string => {
      if (!user.id_role) return '';
      return typeof user.id_role === 'object' ? user.id_role.role_name : '';
    };
    return {
      total: users.length,
      admins: users.filter(u => getRoleName(u) === 'admin').length,
      boutiques: users.filter(u => getRoleName(u) === 'boutique').length,
      clients: users.filter(u => getRoleName(u) === 'user').length,
      Nouveaux: users.filter(u => {
        const createdAt = new Date(u.createdAt || '');
        const now = new Date();
        const diffInDays = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
        return diffInDays <= 1; // Considérer comme nouveau si inscrit dans les 1 derniers jours
      }).length
      // actifs: users.filter(u => u.actif).length
    };
  }
}
