import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-tourism-map-toolbar',
  imports: [CommonModule, FormsModule],
  templateUrl: './tourism-map-toolbar.component.html',
  styleUrl: './tourism-map-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourismMapToolbarComponent {
  @Input() loading = false;
  @Input() selectedCategory: string | null = null;

  @Output() readonly search = new EventEmitter<string>();
  @Output() readonly categorySelect = new EventEmitter<string>();

  searchQuery = '';

  readonly categories = [
    { id: 'museum', label: 'Museums', icon: 'museum' },
    { id: 'monument', label: 'Monuments', icon: 'fort' },
    { id: 'nature', label: 'Nature', icon: 'landscape' },
    { id: 'gastronomy', label: 'Gastronomy', icon: 'restaurant' },
  ];

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    this.search.emit(this.searchQuery);
  }

  onCategoryClick(categoryId: string): void {
    const newCategory = this.selectedCategory === categoryId ? null : categoryId;
    this.categorySelect.emit(newCategory || '');
  }
}
