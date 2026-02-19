import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SLIDER_IMAGES } from '../data/mock-data';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  getSliderImages(): Observable<any[]> {
    return of(SLIDER_IMAGES).pipe(delay(100));
  }

  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-MG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(prix) + ' Ar';
  }
}
