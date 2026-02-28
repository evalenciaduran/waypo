import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-tourism-skeleton-loader',
    imports: [CommonModule],
    template: `
    <div class="tp-skeleton">
      <h2 class="tp-skeleton__title">Cargando sugerencias...</h2>
      
      <!-- Skeleton Card 1 -->
      <div class="tp-skeleton__card">
        <div class="tp-skeleton__card-img"></div>
        <div class="tp-skeleton__card-content">
          <div class="tp-skeleton__text-row-1"></div>
          <div class="tp-skeleton__text-row-2"></div>
          <div class="tp-skeleton__text-row-3">
            <div class="tp-skeleton__text-xs"></div>
            <div class="tp-skeleton__text-sm"></div>
          </div>
        </div>
      </div>

      <!-- Skeleton Card 2 -->
      <div class="tp-skeleton__card">
        <div class="tp-skeleton__card-img"></div>
        <div class="tp-skeleton__card-content">
          <div class="tp-skeleton__text-row-1" style="width: 66%"></div>
          <div class="tp-skeleton__text-row-2" style="width: 33%"></div>
          <div class="tp-skeleton__text-row-3">
            <div class="tp-skeleton__text-xs"></div>
            <div class="tp-skeleton__text-sm"></div>
          </div>
        </div>
      </div>

      <!-- Skeleton Map Area -->
      <div class="tp-skeleton__map">
        <span class="material-symbols-outlined tp-skeleton__map-icon">map</span>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .tp-skeleton {
      padding: 1rem 1rem 0 1rem;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      
      &__title {
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0 0 1rem 0;
        padding: 0 0.25rem;
        color: var(--ion-text-color, #0f172a);
      }

      &__card {
        background: var(--ion-background-color, #ffffff);
        border-radius: 0.75rem;
        padding: 1rem;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        border: 1px solid var(--ion-color-step-100, #f1f5f9);
        margin-bottom: 1rem;
        display: flex;
        gap: 1rem;
      }

      &__card-img {
        width: 6rem;
        height: 6rem;
        border-radius: 0.5rem;
        background: var(--ion-color-step-200, #e2e8f0);
        flex-shrink: 0;
      }

      &__card-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: 0.5rem;
        padding: 0.25rem 0;
      }

      &__text-row-1 {
        height: 1rem;
        background: var(--ion-color-step-200, #e2e8f0);
        border-radius: 0.25rem;
        width: 75%;
      }

      &__text-row-2 {
        height: 0.75rem;
        background: var(--ion-color-step-200, #e2e8f0);
        border-radius: 0.25rem;
        width: 50%;
      }

      &__text-row-3 {
        margin-top: auto;
        display: flex;
        gap: 0.5rem;
      }

      &__text-xs {
        height: 0.75rem;
        background: var(--ion-color-step-200, #e2e8f0);
        border-radius: 0.25rem;
        width: 2rem;
      }

      &__text-sm {
        height: 0.75rem;
        background: var(--ion-color-step-200, #e2e8f0);
        border-radius: 0.25rem;
        width: 4rem;
      }

      &__map {
        width: 100%;
        height: 12rem;
        border-radius: 0.75rem;
        background: var(--ion-color-step-200, #e2e8f0);
        margin-top: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &__map-icon {
        color: var(--ion-color-step-300, #cbd5e1);
        font-size: 36px;
      }
    }

    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      .tp-skeleton {
        &__title {
          color: #ffffff;
        }
        
        &__card {
          background: var(--ion-color-step-100, #1a2c35); /* From Stitch dark mode specs */
          border-color: var(--ion-color-step-200, #1e293b);
        }

        &__card-img, &__text-row-1, &__text-row-2, &__text-xs, &__text-sm, &__map {
          background: var(--ion-color-step-200, #334155);
        }

        &__map-icon {
          color: var(--ion-color-step-300, #475569);
        }
      }
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourismSkeletonLoaderComponent { }
