import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonInput, IonItem, IonSelect, IonSelectOption } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-tourism-map-toolbar',
  imports: [FormsModule, IonItem, IonInput, IonSelect, IonSelectOption, IonButton],
  templateUrl: './tourism-map-toolbar.component.html',
  styleUrl: './tourism-map-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourismMapToolbarComponent {
  @Input({ required: true }) loading = false;

  @Output() readonly reload = new EventEmitter<void>();
  @Output() readonly requestRoute = new EventEmitter<{
    origin: string;
    destination: string;
    mode: 'driving' | 'walking' | 'transit';
  }>();

  origin = '';
  destination = '';
  mode: 'driving' | 'walking' | 'transit' = 'driving';

  onRouteSubmit(): void {
    this.requestRoute.emit({
      origin: this.origin,
      destination: this.destination,
      mode: this.mode,
    });
  }
}
