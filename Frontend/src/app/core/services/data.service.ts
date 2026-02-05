import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Boutique, Categorie, Promotion } from '../models/boutique.model';
import { BOUTIQUES, CATEGORIES, PROMOTIONS, SLIDER_IMAGES } from '../data/mock-data';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // Récupérer toutes les boutiques
  getBoutiques(): Observable<Boutique[]> {
    return of(BOUTIQUES).pipe(delay(300));
  }

  // Récupérer une boutique par ID
  getBoutiqueById(id: string): Observable<Boutique | undefined> {
    const boutique = BOUTIQUES.find(b => b.id === id);
    return of(boutique).pipe(delay(200));
  }

  // Récupérer les boutiques par type
  getBoutiquesByType(type: 'boutique' | 'restaurant' | 'service'): Observable<Boutique[]> {
    const boutiques = BOUTIQUES.filter(b => b.type === type);
    return of(boutiques).pipe(delay(300));
  }

  // Récupérer les boutiques par catégorie
  getBoutiquesByCategorie(categorieId: string): Observable<Boutique[]> {
    const boutiques = BOUTIQUES.filter(b => b.categorie === categorieId);
    return of(boutiques).pipe(delay(300));
  }

  // Récupérer les boutiques par étage
  getBoutiquesByEtage(etage: number): Observable<Boutique[]> {
    const boutiques = BOUTIQUES.filter(b => b.etage === etage);
    return of(boutiques).pipe(delay(300));
  }

  // Rechercher des boutiques
  searchBoutiques(query: string): Observable<Boutique[]> {
    const lowerQuery = query.toLowerCase();
    const boutiques = BOUTIQUES.filter(b =>
      b.nom.toLowerCase().includes(lowerQuery) ||
      b.description.toLowerCase().includes(lowerQuery) ||
      b.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
    return of(boutiques).pipe(delay(300));
  }

  // Récupérer toutes les catégories
  getCategories(): Observable<Categorie[]> {
    return of(CATEGORIES).pipe(delay(200));
  }

  // Récupérer toutes les promotions
  getPromotions(): Observable<Promotion[]> {
    return of(PROMOTIONS).pipe(delay(300));
  }

  // Récupérer les promotions actives
  getPromotionsActives(): Observable<Promotion[]> {
    const now = new Date();
    const promotions = PROMOTIONS.filter(p =>
      new Date(p.dateDebut) <= now && new Date(p.dateFin) >= now
    );
    return of(promotions).pipe(delay(300));
  }

  // Récupérer les promotions d'une boutique
  getPromotionsByBoutique(boutiqueId: string): Observable<Promotion[]> {
    const promotions = PROMOTIONS.filter(p => p.boutiqueId === boutiqueId);
    return of(promotions).pipe(delay(200));
  }

  // Récupérer les images du slider
  getSliderImages(): Observable<any[]> {
    return of(SLIDER_IMAGES).pipe(delay(100));
  }

  // Récupérer les boutiques en vedette (les mieux notées)
  getBoutiquesVedettes(): Observable<Boutique[]> {
    const boutiques = [...BOUTIQUES]
      .sort((a, b) => b.note - a.note)
      .slice(0, 6);
    return of(boutiques).pipe(delay(300));
  }

  // Récupérer les nouvelles boutiques
  getNouvellesBoutiques(): Observable<Boutique[]> {
    const boutiques = BOUTIQUES.filter(b => b.nouveau);
    return of(boutiques).pipe(delay(300));
  }

  // Formater le prix en Ariary
  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-MG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(prix) + ' Ar';
  }
}
