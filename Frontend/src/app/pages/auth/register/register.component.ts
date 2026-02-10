import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { RoleService } from '../../../core/role_user/services/role.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  nom = '';
  prenom = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  selectedRole = '';
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  error = signal('');
  roles: any[] = [];

  user = {
    username: '',
    email: '',
    password: '',
    id_role: ''
  };

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update(v => !v);
  }
  constructor(
    private router: Router,
    private authService: AuthService,
    private roleService: RoleService
  ) {}

  ngOnInit() {
    // Load roles
    this.roleService.getRoles().subscribe(roles => {
      this.roles = roles;
      console.log('Available roles:', roles);
    });
  }

  onSubmit() {
    this.error.set('');

    if (!this.nom || !this.prenom || !this.email || !this.password || !this.confirmPassword) {
      this.error.set('Veuillez remplir tous les champs');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error.set('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.password.length < 8) {
      this.error.set('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    // if (!this.acceptTerms) {
    //   this.error.set('Veuillez accepter les conditions d\'utilisation');
    //   return;
    // }

    this.isLoading.set(true);
    this.user= {
      username: this.prenom + ' ' + this.nom,
      email: this.email,
      password: this.password,
      id_role: this.selectedRole
    };
    this.authService.register(this.user).subscribe({
      next: (userConnected) => {
        console.log('Registered user:', userConnected);
        localStorage.setItem('user', JSON.stringify(userConnected.user));
        this.isLoading.set(false);
        if (userConnected.user.role === 'boutique') {
          this.router.navigate(['/seller/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
        // this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Erreur lors de l\'inscription');
      }
    });
  }
}
