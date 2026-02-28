import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText } from '@ionic/angular/standalone';
import { TourismMapStore } from '../state/tourism-map.store';
import { TourismMapToolbarComponent } from '../ui/tourism-map-toolbar.component';
import { TourismPoiListComponent } from '../ui/tourism-poi-list.component';

@Component({
  standalone: true,
  selector: 'app-tourism-map-page',
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonText,
    TourismMapToolbarComponent,
    TourismPoiListComponent,
  ],
  templateUrl: './tourism-map-page.container.html',
  styleUrl: './tourism-map-page.container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourismMapPageContainer implements OnInit {
  private readonly store = inject(TourismMapStore);

  readonly vm = this.store.vm;

  ngOnInit(): void {
    this.store.loadPois({ limit: 100, city: 'Madrid' });
  }

  onReload(): void {
    this.store.loadPois({ limit: 100, city: 'Madrid' });
  }

  onSelectPoi(id: string): void {
    this.store.selectPoi(id);
  }

  onRequestRoute(event: { origin: string; destination: string; mode: 'driving' | 'walking' | 'transit' }): void {
    const origin = this.parsePoint(event.origin);
    const destination = this.parsePoint(event.destination);

    if (!origin || !destination) {
      return;
    }

    this.store.calculateRoute({
      origin,
      destination,
      mode: event.mode,
    });
  }

  private parsePoint(value: string): { lat: number; lng: number } | null {
    const [latRaw, lngRaw] = value.split(',').map((item) => item.trim());
    const lat = Number(latRaw);
    const lng = Number(lngRaw);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return null;
    }

    return { lat, lng };
  }
}
