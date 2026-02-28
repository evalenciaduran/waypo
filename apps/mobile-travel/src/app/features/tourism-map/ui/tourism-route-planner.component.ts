import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouteSummary } from '@tourism/domain';

export type TravelMode = 'driving' | 'walking' | 'transit' | 'bicycling';

@Component({
    standalone: true,
    selector: 'app-tourism-route-planner',
    imports: [CommonModule, FormsModule],
    templateUrl: './tourism-route-planner.component.html',
    styleUrl: './tourism-route-planner.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourismRoutePlannerComponent {
    @Input() origin = 'Current Location';
    @Input() destination = '';
    @Input() route: RouteSummary | null = null;
    @Input() isOffline = false;

    @Output() readonly close = new EventEmitter<void>();
    @Output() readonly calculateRoute = new EventEmitter<{ origin: string, destination: string, mode: TravelMode }>();
    @Output() readonly startNavigation = new EventEmitter<void>();

    selectedMode: TravelMode = 'driving';

    onModeChange(mode: TravelMode): void {
        this.selectedMode = mode;
        this.requestRoute();
    }

    onSwapLocations(): void {
        const temp = this.origin;
        this.origin = this.destination;
        this.destination = temp;
        this.requestRoute();
    }

    requestRoute(): void {
        if (this.origin && this.destination) {
            this.calculateRoute.emit({
                origin: this.origin,
                destination: this.destination,
                mode: this.selectedMode
            });
        }
    }

    clearDestination(): void {
        this.destination = '';
    }
}
