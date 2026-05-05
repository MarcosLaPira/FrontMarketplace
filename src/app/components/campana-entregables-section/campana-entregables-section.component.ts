import { Component, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { EntregableInput } from '../../models/types';

@Component({
  selector: 'app-campana-entregables-section',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './campana-entregables-section.component.html'
})
export class CampanaEntregablesSectionComponent {
  items = input<EntregableInput[]>([]);
  itemsChange = output<EntregableInput[]>();

  nuevoEntregable = signal<{ descripcion: string; fechaLimite: string }>({
    descripcion: '', fechaLimite: ''
  });

  get canAgregar(): boolean {
    const e = this.nuevoEntregable();
    return !!e.descripcion.trim() && !!e.fechaLimite;
  }

  get hasEntregable(): boolean {
    return this.items().length > 0;
  }

  setField(field: 'descripcion' | 'fechaLimite', value: string): void {
    this.nuevoEntregable.update(e => ({ ...e, [field]: value }));
  }

  agregar(): void {
    if (!this.canAgregar) return;
    if (this.hasEntregable) return;
    const e = this.nuevoEntregable();
    this.itemsChange.emit([
      { descripcion: e.descripcion.trim(), fechaLimite: e.fechaLimite, orden: 1 }
    ]);
    this.nuevoEntregable.set({ descripcion: '', fechaLimite: '' });
  }

  eliminar(idx: number): void {
    this.itemsChange.emit(
      this.items()
        .filter((_, i) => i !== idx)
        .map((e, i) => ({ ...e, orden: i + 1 }))
    );
  }
}
