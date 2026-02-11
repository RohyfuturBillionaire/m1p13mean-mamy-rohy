import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { SellerService } from '../../../core/services/seller.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);
  error = signal('');

  constructor(
    private router: Router,
    private adminService: AdminService,
    private authService: AuthService,
    private sellerService: SellerService
  ) {}

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    this.error.set('');

    if (!this.username || !this.password) {
      this.error.set('Veuillez remplir tous les champs');
      return;
    }

    this.isLoading.set(true);
    this.authService.login(this.username, this.password).subscribe(u => {
      console.log('Login response:', u);
      if ( u.user.role === null ) {
        console.log('Logged in as admin:', u.user.role);
        localStorage.setItem('user', JSON.stringify(u));
        this.isLoading.set(false);
        this.router.navigate(['/admin/dashboard']);
      } else if (u.user.role === 'boutique') {
        this.isLoading.set(false);
        console.log('Logged in as boutique:', u);
        localStorage.setItem('user', JSON.stringify(u));
        this.sellerService.login("boutique", "boutique");
  //     }
        this.router.navigate(['/seller/dashboard']);
        return;
      }
      else {
          this.error.set('Identifiants incorrects. Utilisez admin/admin ou boutique/boutique.');
        }
    });
    // this.authService.login(this.username, this.password)
    // Check for boutique credentials first
  //   this.sellerService.login(this.username, this.password).subscribe(sellerSuccess => {
  //     if (sellerSuccess) {
  //       this.isLoading.set(false);
  //       this.router.navigate(['/seller/dashboard']);
  //       return;
  //     }

  //     // If not boutique, check for admin credentials
  //     this.adminService.login(this.username, this.password).subscribe(adminSuccess => {
  //       this.isLoading.set(false);
  //       if (adminSuccess) {
  //         this.router.navigate(['/admin/dashboard']);
  //       } else {
  //         this.error.set('Identifiants incorrects. Utilisez admin/admin ou boutique/boutique.');
  //       }
  //     });
  //   });
  }
}
