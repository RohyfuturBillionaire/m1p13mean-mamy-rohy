import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-boutique-pending',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="pending-container">
      <div class="pending-card">
        <div class="icon-wrapper">
          <span class="material-icons">store</span>
        </div>
        <h1>Compte en attente</h1>
        <p class="message">
          Votre compte boutique n'est pas encore rattache a une boutique.
          Veuillez contacter l'administrateur.
        </p>
        <div class="info-box">
          <span class="material-icons">info</span>
          <p>
            Un administrateur doit associer votre compte a une boutique
            avant que vous puissiez acceder a l'interface de gestion.
          </p>
        </div>
        <button class="btn-logout" (click)="logout()">
          <span class="material-icons">logout</span>
          Se deconnecter
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pending-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .pending-card {
      background: white;
      border-radius: 16px;
      padding: 3rem 2.5rem;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }

    .icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #FEF3C7;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;

      .material-icons {
        font-size: 2.5rem;
        color: #D97706;
      }
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1E293B;
      margin: 0 0 0.75rem;
    }

    .message {
      color: #64748B;
      font-size: 1rem;
      line-height: 1.6;
      margin: 0 0 1.5rem;
    }

    .info-box {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: #F0F9FF;
      border: 1px solid #BAE6FD;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 2rem;
      text-align: left;

      .material-icons {
        color: #0284C7;
        font-size: 1.25rem;
        margin-top: 0.125rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #334155;
        line-height: 1.5;
      }
    }

    .btn-logout {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: #EF4444;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #DC2626;
      }

      .material-icons {
        font-size: 1.125rem;
      }
    }
  `]
})
export class BoutiquePendingComponent {
  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/connexion']);
  }
}
