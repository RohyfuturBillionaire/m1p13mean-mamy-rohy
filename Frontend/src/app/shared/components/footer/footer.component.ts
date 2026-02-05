import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  horaires = [
    { jour: 'Lundi - Vendredi', heures: '10:00 - 21:00' },
    { jour: 'Samedi', heures: '09:00 - 21:00' },
    { jour: 'Dimanche', heures: '10:00 - 18:00' }
  ];

  socialLinks = [
    { name: 'Facebook', icon: 'facebook', url: '#' },
    { name: 'Instagram', icon: 'instagram', url: '#' },
    { name: 'Twitter', icon: 'twitter', url: '#' },
    { name: 'LinkedIn', icon: 'linkedin', url: '#' }
  ];
}
