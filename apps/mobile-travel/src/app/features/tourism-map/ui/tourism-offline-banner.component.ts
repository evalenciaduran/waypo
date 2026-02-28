import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-tourism-offline-banner',
    imports: [CommonModule],
    template: `
    <div class="tp-offline-banner">
      <div class="tp-offline-banner__content">
        <span class="material-symbols-outlined tp-offline-banner__icon">wifi_off</span>
        <p class="tp-offline-banner__text">Modo sin conexión</p>
      </div>
      <p class="tp-offline-banner__subtext">Mostrando datos guardados</p>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .tp-offline-banner {
      width: 100%;
      background: var(--ion-color-step-800, #1e293b);
      color: #ffffff;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;

      &__content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      &__icon {
        color: var(--ion-color-warning, #fbbf24);
      }

      &__text {
        font-size: 0.875rem;
        font-weight: 500;
        margin: 0;
      }

      &__subtext {
        font-size: 0.75rem;
        color: var(--ion-color-step-300, #cbd5e1);
        margin: 0;
      }
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourismOfflineBannerComponent { }
