import {
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    EventEmitter,
    SimpleChanges,
    ViewChild,
    ChangeDetectionStrategy,
    AfterViewInit,
    NgZone,
} from '@angular/core';
import * as L from 'leaflet';
import { TourismPoi } from '@tourism/domain';

export interface MapBoundsEvent {
    neLat: number;
    neLng: number;
    swLat: number;
    swLng: number;
}

/** Category → color mapping for markers */
const CATEGORY_COLORS: Record<string, string> = {
    museum: '#8B5CF6',
    landmark: '#F59E0B',
    attraction: '#EC4899',
    restaurant: '#EF4444',
    cafe: '#A16207',
    bar: '#7C3AED',
    accommodation: '#3B82F6',
    viewpoint: '#10B981',
    art: '#D946EF',
    info: '#6B7280',
    general: '#64748B',
};

function createMarkerIcon(color: string, highlighted: boolean): L.DivIcon {
    const size = highlighted ? 32 : 24;
    return L.divIcon({
        className: 'custom-poi-marker',
        html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ${highlighted ? 'transform: scale(1.2); z-index: 1000;' : ''}
    "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });
}

@Component({
    standalone: true,
    selector: 'app-tourism-leaflet-map',
    template: `<div #mapContainer class="leaflet-map-container"></div>`,
    styles: [
        `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .leaflet-map-container {
        width: 100%;
        height: 100%;
      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourismLeafletMapComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

    @Input() pois: readonly TourismPoi[] = [];
    @Input() selectedPoiId: string | null = null;

    @Output() poiSelect = new EventEmitter<string>();
    @Output() boundsChange = new EventEmitter<MapBoundsEvent>();

    private map!: L.Map;
    private markersLayer = L.layerGroup();
    private markerMap = new Map<string, L.Marker>();
    private boundsTimeout: ReturnType<typeof setTimeout> | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private initialized = false;

    constructor(private readonly ngZone: NgZone) { }

    ngOnInit(): void {
        this.initMap();
    }

    ngAfterViewInit(): void {
        // Force Leaflet to recalculate size after Angular finishes rendering
        setTimeout(() => {
            if (this.map) {
                this.map.invalidateSize();
            }
        }, 100);

        // Also observe container resize (e.g. orientation change, Ionic layout shifts)
        this.resizeObserver = new ResizeObserver(() => {
            if (this.map) {
                this.map.invalidateSize();
            }
        });
        this.resizeObserver.observe(this.mapContainer.nativeElement);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.map) return;

        if (changes['pois']) {
            this.updateMarkers();
        }
        if (changes['selectedPoiId']) {
            this.highlightSelected();
        }
    }

    ngOnDestroy(): void {
        if (this.boundsTimeout) clearTimeout(this.boundsTimeout);
        this.resizeObserver?.disconnect();
        this.map?.remove();
    }

    private initMap(): void {
        this.map = L.map(this.mapContainer.nativeElement, {
            center: [40.4168, -3.7038],
            zoom: 13,
            zoomControl: false,
            attributionControl: true,
        });

        // OpenStreetMap tiles — free, no API key
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(this.map);

        // Zoom control on the right side
        L.control.zoom({ position: 'topright' }).addTo(this.map);

        this.markersLayer.addTo(this.map);

        // Emit bounds on map move (debounced), run outside Angular zone for performance
        this.map.on('moveend', () => {
            this.emitBoundsDebounced();
        });

        // Initial bounds emit after a delay to allow first render
        setTimeout(() => {
            this.map.invalidateSize();
            this.emitBounds();
            this.initialized = true;
        }, 300);
    }

    private updateMarkers(): void {
        this.markersLayer.clearLayers();
        this.markerMap.clear();

        for (const poi of this.pois) {
            if (!poi.location?.lat || !poi.location?.lng) continue;

            const color = CATEGORY_COLORS[poi.category] ?? CATEGORY_COLORS['general'];
            const isSelected = poi.id === this.selectedPoiId;
            const icon = createMarkerIcon(color, isSelected);

            const marker = L.marker([poi.location.lat, poi.location.lng], {
                icon,
                title: poi.name,
            });

            marker.bindPopup(
                `<div style="min-width: 150px;">
          <strong style="font-size: 14px;">${poi.name || 'Sin nombre'}</strong>
          <br/><span style="color: ${color}; font-weight: 600; text-transform: capitalize;">● ${poi.category}</span>
          ${poi.shortDescription ? '<br/><span style="font-size: 12px; color: #666;">' + poi.shortDescription.slice(0, 100) + '</span>' : ''}
        </div>`
            );

            marker.on('click', () => {
                this.ngZone.run(() => {
                    this.poiSelect.emit(poi.id);
                });
            });

            this.markerMap.set(poi.id, marker);
            this.markersLayer.addLayer(marker);
        }

        // Fit bounds to markers if there are any, but only on initial load
        if (this.pois.length > 0 && !this.initialized) {
            const validPois = this.pois.filter((p) => p.location?.lat && p.location?.lng);
            if (validPois.length > 1) {
                const bounds = L.latLngBounds(validPois.map((p) => [p.location.lat, p.location.lng] as L.LatLngTuple));
                this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
            } else if (validPois.length === 1) {
                this.map.setView([validPois[0].location.lat, validPois[0].location.lng], 14);
            }
        }
    }

    private highlightSelected(): void {
        for (const [id, marker] of this.markerMap) {
            const poi = this.pois.find((p) => p.id === id);
            if (!poi) continue;
            const color = CATEGORY_COLORS[poi.category] ?? CATEGORY_COLORS['general'];
            marker.setIcon(createMarkerIcon(color, id === this.selectedPoiId));
        }

        if (this.selectedPoiId) {
            const marker = this.markerMap.get(this.selectedPoiId);
            if (marker) {
                marker.openPopup();
            }
        }
    }

    private emitBoundsDebounced(): void {
        if (this.boundsTimeout) clearTimeout(this.boundsTimeout);
        this.boundsTimeout = setTimeout(() => this.emitBounds(), 500);
    }

    private emitBounds(): void {
        if (!this.map) return;
        const bounds = this.map.getBounds();
        this.ngZone.run(() => {
            this.boundsChange.emit({
                neLat: bounds.getNorthEast().lat,
                neLng: bounds.getNorthEast().lng,
                swLat: bounds.getSouthWest().lat,
                swLng: bounds.getSouthWest().lng,
            });
        });
    }
}
