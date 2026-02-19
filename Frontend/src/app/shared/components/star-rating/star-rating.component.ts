import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating" [class.interactive]="interactive">
      @for (star of stars; track star) {
        <button
          class="star"
          [class.filled]="star <= (hoveredStar() || note)"
          [class.hovered]="interactive && hoveredStar() > 0 && star <= hoveredStar()"
          (mouseenter)="interactive ? hoveredStar.set(star) : null"
          (mouseleave)="interactive ? hoveredStar.set(0) : null"
          (click)="interactive ? onRate(star) : null"
          [disabled]="!interactive"
        >
          <svg xmlns="http://www.w3.org/2000/svg" [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24"
            [attr.fill]="star <= (hoveredStar() || note) ? '#F59E0B' : 'none'"
            [attr.stroke]="star <= (hoveredStar() || note) ? '#F59E0B' : '#D1D5DB'"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>
      }
      @if (showCount && count > 0) {
        <span class="rating-count">({{ count }})</span>
      }
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
    .star {
      background: none;
      border: none;
      padding: 0;
      cursor: default;
      display: flex;
      align-items: center;
      transition: transform 0.15s ease;
    }
    .interactive .star {
      cursor: pointer;
      &:hover { transform: scale(1.15); }
    }
    .rating-count {
      font-size: 0.8rem;
      color: #6B7280;
      margin-left: 4px;
    }
  `]
})
export class StarRatingComponent {
  @Input() note = 0;
  @Input() count = 0;
  @Input() interactive = false;
  @Input() showCount = true;
  @Input() size = 16;
  @Output() rated = new EventEmitter<number>();

  hoveredStar = signal(0);
  stars = [1, 2, 3, 4, 5];

  onRate(star: number): void {
    this.rated.emit(star);
  }
}
