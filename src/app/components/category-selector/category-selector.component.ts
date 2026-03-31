import { Component, input, output } from '@angular/core';
import { Categoria } from '../../models/types';

@Component({
  selector: 'app-category-selector',
  standalone: true,
  templateUrl: './category-selector.component.html'
})
export class CategorySelectorComponent {
  categorias = input.required<Categoria[]>();
  selectedIds = input.required<number[]>();
  color = input<'blue' | 'green'>('blue');

  toggled = output<number>();

  toggle(id: number): void {
    this.toggled.emit(id);
  }

  isSelected(id: number): boolean {
    return this.selectedIds().includes(id);
  }
}
