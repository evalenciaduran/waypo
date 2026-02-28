import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-tourism-empty-state',
    imports: [CommonModule],
    template: `
    <div class="tp-empty-state">
      <div class="tp-empty-state__graphic">
        <div class="tp-empty-state__graphic-bg"></div>
        <span class="material-symbols-outlined tp-empty-state__icon">cloud_off</span>
      </div>
      <h3 class="tp-empty-state__title">¡Vaya! Sin conexión</h3>
      <p class="tp-empty-state__desc">
        No podemos conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.
      </p>
      <button class="tp-empty-state__btn" (click)="retry.emit()">
        <span class="material-symbols-outlined">refresh</span>
        <span>Reintentar</span>
      </button>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .tp-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1.5rem;
      border-bottom: 1px solid var(--ion-color-step-100, #f1f5f9);

      &__graphic {
        width: 100%;
        max-width: 280px;
        aspect-ratio: 1 / 1;
        background: var(--ion-color-step-100, #f1f5f9);
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
        overflow: hidden;
        position: relative;
      }

      &__graphic-bg {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top right, rgba(19,164,236,0.1), rgba(19,164,236,0.3));
      }

      &__icon {
        color: var(--ion-color-primary, #13a4ec);
        font-size: 60px;
        opacity: 0.5;
        z-index: 1;
      }

      &__title {
        font-size: 1.25rem;
        font-weight: 700;
        text-align: center;
        margin: 0 0 0.5rem 0;
        color: var(--ion-text-color, #0f172a);
      }

      &__desc {
        color: var(--ion-color-medium, #64748b);
        text-align: center;
        font-size: 0.875rem;
        margin: 0 0 1.5rem 0;
        max-width: 260px;
        line-height: 1.5;
      }

      &__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background: var(--ion-color-primary, #13a4ec);
        color: var(--ion-color-primary-contrast, #ffffff);
        padding: 0.75rem 1.5rem;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 1rem;
        border: none;
        width: 100%;
        max-width: 200px;
        cursor: pointer;
        transition: background 0.2s;

        &:active {
          transform: scale(0.98);
        }
      }
    }

    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      .tp-empty-state {
        border-bottom-color: var(--ion-color-step-200, #1e293b);

        &__graphic {
          background: var(--ion-color-step-200, #1e293b);
        }

        &__title {
          color: #ffffff;
        }
      }
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourismEmptyStateComponent {
    @Output() retry = new EventEmitter<void>();
}
