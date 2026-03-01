import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonModal } from '@ionic/angular/standalone';
import { TourismMapStore } from '../state/tourism-map.store';
import { TourismMapToolbarComponent } from '../ui/tourism-map-toolbar.component';
import { TourismPoiListComponent } from '../ui/tourism-poi-list.component';
import { TourismBottomNavComponent } from '../ui/tourism-bottom-nav.component';
import { TourismPoiDetailComponent } from '../ui/tourism-poi-detail.component';
import { TourismRoutePlannerComponent, TravelMode } from '../ui/tourism-route-planner.component';
import { TourismOfflineBannerComponent } from '../ui/tourism-offline-banner.component';
import { TourismEmptyStateComponent } from '../ui/tourism-empty-state.component';
import { TourismSkeletonLoaderComponent } from '../ui/tourism-skeleton-loader.component';
import { TourismSavedListComponent } from '../ui/tourism-saved-list.component';
import { TourismLeafletMapComponent, MapBoundsEvent } from '../ui/tourism-leaflet-map.component';
import { TourismPoi } from '@tourism/domain';

@Component({
  standalone: true,
  selector: 'app-tourism-map-page',
  imports: [
    CommonModule,
    IonContent,
    IonModal,
    TourismMapToolbarComponent,
    TourismPoiListComponent,
    TourismBottomNavComponent,
    TourismPoiDetailComponent,
    TourismRoutePlannerComponent,
    TourismOfflineBannerComponent,
    TourismEmptyStateComponent,
    TourismSkeletonLoaderComponent,
    TourismSavedListComponent,
    TourismLeafletMapComponent,
  ],
  templateUrl: './tourism-map-page.container.html',
  styleUrl: './tourism-map-page.container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourismMapPageContainer implements OnInit {
  readonly store = inject(TourismMapStore);

  readonly vm = this.store.vm;
  selectedCategory: string | null = null;
  isRoutingMode = false;

  ngOnInit(): void {
    // In a real app we'd inject Network status here
    // For MVP phase mock it based on no network data
    this.store.loadPois({ limit: 100, city: 'Spain' });
  }

  get isOffline(): boolean {
    return this.vm().error === 'Failed to load POIs'; // basic mock for now
  }

  onSearch(query: string): void {
    this.store.loadPois({ limit: 100, city: query || 'Spain' });
  }

  onCategorySelect(category: string): void {
    this.selectedCategory = category || null;
  }

  onSelectPoi(id: string): void {
    this.store.selectPoi(id);
  }

  onClosePoiDetail(): void {
    this.store.selectPoi('');
  }

  onGetDirections(poi: TourismPoi): void {
    this.store.selectPoi('');
    this.isRoutingMode = true;
  }

  onOpenRoutePlanner(): void {
    this.isRoutingMode = true;
  }

  onCloseRoutePlanner(): void {
    this.isRoutingMode = false;
  }

  onBoundsChange(bounds: MapBoundsEvent): void {
    this.store.loadPois({
      limit: 100,
      bounds: {
        northEast: { lat: bounds.neLat, lng: bounds.neLng },
        southWest: { lat: bounds.swLat, lng: bounds.swLng },
      },
    });
  }

  onCalculateRoute(event: { origin: string; destination: string; mode: TravelMode }): void {
    const origin = this.parsePoint(event.origin);
    const destination = this.parsePoint(event.destination);

    if (!origin || !destination) return;

    // Use mode 'driving' as fallback since domain type may be stricter
    this.store.calculateRoute({
      origin,
      destination,
      mode: event.mode === 'bicycling' ? 'driving' : event.mode,
    });
  }

  private parsePoint(value: string): { lat: number; lng: number } | null {
    if (value === 'Current Location') return { lat: 40.4168, lng: -3.7038 }; // Mock Madrid center

    // Naive parse for demo purposes
    const [latRaw, lngRaw] = value.split(',').map((item) => item.trim());
    const lat = Number(latRaw);
    const lng = Number(lngRaw);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      // Mock random coord if named location was entered
      return { lat: 41.3851 + Math.random(), lng: 2.1734 + Math.random() };
    }

    return { lat, lng };
  }
}

