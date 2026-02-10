import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ParametresCrm, ParametresSite } from '../../core/models/admin.model';
import { AdminsService } from './services/admins.service';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.scss'
})
export class ParametresComponent implements OnInit {
  parametres = signal<ParametresSite | null>(null);
  parametresCrm = signal<ParametresCrm | null>(null);
  activeSection = signal('general');
  isSaving = signal(false);
  saveSuccess = signal(false);

  parameCrm = {
    nom_centre_commercial: 'test',
    slogan: '',
    email: '',
    telephone: '',
    adresse: '',
    horaire_ouverture: '',
    horaire_fermeture: ''
  };

  sections = [
    { id: 'general', label: 'Général', icon: '🏪' },
    { id: 'contenu', label: 'Contenu', icon: '📝' },
    { id: 'utilisateurs', label: 'Utilisateurs', icon: '👥' },
    { id: 'systeme', label: 'Système', icon: '⚙️' }
  ];

  sliderImages = [
    { id: 1, url: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800', active: true },
    { id: 2, url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', active: true },
    { id: 3, url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800', active: false }
  ];

  constructor(private adminService: AdminService,private adminsService: AdminsService) {}

  ngOnInit() {
    this.loadParametres();
  }

  private loadParametres() {
    this.adminService.getParametres().subscribe(p => {
      this.parametres.set(p);
    });
    this.adminsService.getSiteCrms().subscribe((res: any) => {
      if (res && res.length > 0) {
        this.parametresCrm.set(res[0]);
      }
    });
  }

  saveParametres() {
    const params = this.parametres();
    const paramsCrm = this.parametresCrm();
    if (!params) return;
    console.log(paramsCrm);
    this.isSaving.set(true);
    this.adminsService.addSiteCrm(paramsCrm).subscribe(() => {
      this.isSaving.set(false);
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3000);
    });
  }

  updateParametre(key: string, value: any) {
    const params = this.parametresCrm();
    if (!params) return;

    const updated = { ...params, [key]: value };
    this.parametresCrm.set(updated);
  }

  updateNestedParametre(parent: string, key: string, value: any) {
    const params = this.parametres();
    if (!params) return;

    const parentObj = { ...(params as any)[parent], [key]: value };
    const updated = { ...params, [parent]: parentObj };
    this.parametres.set(updated);
  }

  toggleSliderImage(id: number) {
    const img = this.sliderImages.find(i => i.id === id);
    if (img) {
      img.active = !img.active;
    }
  }

  previewColor(color: string): string {
    return color;
  }
}
