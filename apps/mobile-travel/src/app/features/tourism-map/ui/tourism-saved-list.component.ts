import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourismPoi } from '@tourism/domain';

@Component({
    standalone: true,
    selector: 'app-tourism-saved-list',
    imports: [CommonModule],
    template: `
    <div class="tp-saved-list">
      <h2 class="tp-saved-list__title">Tus Sitios Guardados</h2>
      
      <div 
        class="tp-saved-list__item" 
        *ngFor="let poi of savedPois"
      >
        <div 
          class="tp-saved-list__img" 
          [style.background-image]="'url(' + (poi.imageUrl || 'https://images.unsplash.com/photo-1539037116277-4db20d00508f?auto=format&fit=crop&q=80') + ')'"
        >
          <div class="tp-saved-list__badge">
            <span class="material-symbols-outlined tp-saved-list__badge-icon">download_done</span>
          </div>
        </div>
        
        <div class="tp-saved-list__content">
          <div class="tp-saved-list__header">
            <h4 class="tp-saved-list__name">{{ poi.name }}</h4>
            <span class="material-symbols-outlined tp-saved-list__fav-icon">favorite</span>
          </div>
          
          <p class="tp-saved-list__location">{{ poi.city }}, Spain</p>
          
          <div class="tp-saved-list__footer">
            <span class="material-symbols-outlined tp-saved-list__star-icon">star</span>
            <span class="tp-saved-list__rating">4.8</span>
            <span class="tp-saved-list__reviews">(12k reseñas)</span>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .tp-saved-list {
      padding: 2rem 1rem 1rem 1rem;

      &__title {
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0 0 1rem 0;
        padding: 0 0.25rem;
        color: var(--ion-text-color, #0f172a);
      }

      &__item {
        background: var(--ion-background-color, #ffffff);
        border-radius: 0.75rem;
        padding: 0.75rem;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        border: 1px solid var(--ion-color-step-100, #f1f5f9);
        margin-bottom: 1rem;
        display: flex;
        gap: 1rem;
      }

      &__img {
        width: 6rem;
        height: 6rem;
        border-radius: 0.5rem;
        background-size: cover;
        background-position: center;
        background-color: var(--ion-color-step-200, #e2e8f0);
        flex-shrink: 0;
        position: relative;
      }

      &__badge {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        background: rgba(255,255,255,0.9);
        border-radius: 9999px;
        padding: 4px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &__badge-icon {
        color: var(--ion-color-primary, #13a4ec);
        font-size: 16px;
      }

      &__content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
      }

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      &__name {
        font-weight: 700;
        font-size: 1rem;
        line-height: 1.2;
        margin: 0 0 0.25rem 0;
        color: var(--ion-text-color, #0f172a);
      }

      &__fav-icon {
        color: var(--ion-color-primary, #13a4ec);
        font-size: 18px;
        font-variation-settings: 'FILL' 1;
      }

      &__location {
        font-size: 0.75rem;
        color: var(--ion-color-medium, #64748b);
        margin: 0 0 0.5rem 0;
      }

      &__footer {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        margin-top: auto;
      }

      &__star-icon {
        color: var(--ion-color-warning, #fbbf24);
        font-size: 14px;
        font-variation-settings: 'FILL' 1;
      }

      &__rating {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--ion-text-color, #0f172a);
      }

      &__reviews {
        font-size: 0.75rem;
        color: var(--ion-color-medium, #94a3b8);
      }
    }

    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      .tp-saved-list {
        &__title {
          color: #ffffff;
        }

        &__item {
          background: var(--ion-color-step-100, #1a2c35);
          border-color: var(--ion-color-step-200, #1e293b);
        }

        &__badge {
          background: rgba(0,0,0,0.6);
        }

        &__name, &__rating {
          color: #ffffff;
        }
      }
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourismSavedListComponent {
    @Input() savedPois: readonly TourismPoi[] = []; // Simulates saved data
}
