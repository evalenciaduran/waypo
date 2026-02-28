import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of, tap } from 'rxjs';
import { RouteInput, RouteSummary, TourismPoi, TourismPoiFilters } from '@tourism/domain';
import { TOURISM_POI_REPO } from '../data-access/ports/tourism-poi.repo';

@Injectable()
export class TourismMapStore {
  private readonly repo = inject(TOURISM_POI_REPO);
  private readonly destroyRef = inject(DestroyRef);

  private readonly loading = signal(false);
  private readonly pois = signal<readonly TourismPoi[]>([]);
  private readonly selectedPoiId = signal<string | null>(null);
  private readonly route = signal<RouteSummary | null>(null);
  private readonly error = signal<string | null>(null);

  readonly vm = computed(() => {
    const selectedId = this.selectedPoiId();
    return {
      loading: this.loading(),
      pois: this.pois(),
      selectedPoi: selectedId ? this.pois().find((row) => row.id === selectedId) ?? null : null,
      route: this.route(),
      error: this.error(),
    };
  });

  loadPois(filters: TourismPoiFilters): void {
    this.loading.set(true);
    this.error.set(null);

    this.repo
      .list(filters)
      .pipe(
        tap((rows) => this.pois.set(rows)),
        catchError(() => {
          this.error.set('No se pudieron cargar los puntos de interés.');
          this.pois.set([]);
          return of([]);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  selectPoi(id: string): void {
    this.selectedPoiId.set(id);
  }

  calculateRoute(input: RouteInput): void {
    this.loading.set(true);
    this.error.set(null);

    this.repo
      .getRoute(input)
      .pipe(
        tap((summary) => this.route.set(summary)),
        catchError(() => {
          this.error.set('No se pudo calcular la ruta.');
          this.route.set(null);
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  clearError(): void {
    this.error.set(null);
  }
}
