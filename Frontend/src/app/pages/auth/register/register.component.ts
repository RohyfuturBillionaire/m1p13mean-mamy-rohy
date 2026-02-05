import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  error = signal('');

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update(v => !v);
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

    if (!this.acceptTerms) {
      this.error.set('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    this.isLoading.set(true);

    setTimeout(() => {
      this.isLoading.set(false);
      alert('Inscription simulée avec succès ! (Template mode)');
    }, 1500);
  }
}
