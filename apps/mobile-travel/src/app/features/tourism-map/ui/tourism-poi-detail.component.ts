import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourismPoi } from '@tourism/domain';

@Component({
    standalone: true,
    selector: 'app-tourism-poi-detail',
    imports: [CommonModule],
    templateUrl: './tourism-poi-detail.component.html',
    styleUrl: './tourism-poi-detail.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourismPoiDetailComponent {
    @Input({ required: true }) poi!: TourismPoi;

    @Output() readonly close = new EventEmitter<void>();
    @Output() readonly getDirections = new EventEmitter<void>();

    // Placeholder data for the design fields that are not in the model
    readonly mockStats = {
        open: '09:00 - 20:00',
        entry: '€26 - €40',
        duration: '~2 Hours',
        reviews: '12k reviews',
        rating: 4.8
    };
}
