import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-tourism-bottom-nav',
    imports: [CommonModule],
    templateUrl: './tourism-bottom-nav.component.html',
    styleUrl: './tourism-bottom-nav.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourismBottomNavComponent {
    readonly navItems = [
        { id: 'explore', label: 'Explore', icon: 'explore', active: true },
        { id: 'trips', label: 'Trips', icon: 'map', active: false },
        { id: 'saved', label: 'Saved', icon: 'favorite', active: false },
        { id: 'profile', label: 'Profile', icon: 'person', active: false },
    ];
}
