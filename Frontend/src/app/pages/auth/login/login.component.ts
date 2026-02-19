import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../auth/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);
  error = signal('');

  constructor(
    private router: Router,
    private adminService: AdminService,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    this.error.set('');

    if (!this.email || !this.password) {
      this.error.set('Veuillez remplir tous les champs');
      return;
    }

    this.isLoading.set(true);
    this.authService.login(this.email, this.password).subscribe({
      next: (u) => {
        console.log('Login response:', u);
        localStorage.setItem('user', JSON.stringify(u));
        const roleName = (u.user?.role || '').toLowerCase();

        // Sync cart from localStorage to API, then navigate
        this.cartService.syncOnLogin().then(() => {
          this.isLoading.set(false);
          if (!roleName) {
            this.router.navigate(['/admin/dashboard']);
          } else if (roleName === 'boutique') {
            if (u.user?.hasBoutique === false) {
              this.router.navigate(['/boutique-pending']);
            } else {
              this.router.navigate(['/seller/dashboard']);
            }
          } else {
            this.router.navigate(['/']);
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Email ou mot de passe incorrect');
      }
    });
  }
}
