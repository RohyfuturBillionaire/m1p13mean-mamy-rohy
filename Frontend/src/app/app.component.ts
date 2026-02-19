import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, CartDrawerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Tana Center';
  showNavbarFooter = true;
  private routerSubscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Masquer navbar/footer pour les routes admin
        const url = event.urlAfterRedirects;
        this.showNavbarFooter = !url.startsWith('/admin') && !url.startsWith('/seller');
      });

    // Vérifier la route initiale
    const url = this.router.url;
    this.showNavbarFooter = !url.startsWith('/admin') && !url.startsWith('/seller');
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }
}
