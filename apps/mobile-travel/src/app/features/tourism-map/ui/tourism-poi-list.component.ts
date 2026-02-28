import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourismPoi } from '@tourism/domain';

@Component({
  standalone: true,
  selector: 'app-tourism-poi-list',
  imports: [CommonModule],
  templateUrl: './tourism-poi-list.component.html',
  styleUrl: './tourism-poi-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourismPoiListComponent {
  @Input({ required: true }) pois: readonly TourismPoi[] = [];
  @Input() selectedPoiId: string | null = null;

  @Output() readonly selectPoi = new EventEmitter<string>();

  trackByPoiId(_index: number, poi: TourismPoi): string {
    return poi.id;
  }
}
