import { Component, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Plataforma, TipoContenido, PlataformaContenidoInput } from '../../models/types';

@Component({
  selector: 'app-campana-plataformas-section',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './campana-plataformas-section.component.html'
})
export class CampanaPlataformasSectionComponent {
  plataformas = input.required<Plataforma[]>();
  tiposContenido = input.required<TipoContenido[]>();
  tipoPago = input<string>('monetario');
  items = input<PlataformaContenidoInput[]>([]);

  itemsChange = output<PlataformaContenidoInput[]>();
  tipoPagoChange = output<string>();

  nuevaPC = signal<{ idPlataforma: string; idTipoContenido: string; precio: string }>({
    idPlataforma: '', idTipoContenido: '', precio: ''
  });

  get canAgregar(): boolean {
    const pc = this.nuevaPC();
    return !!pc.idPlataforma && !!pc.idTipoContenido && !!pc.precio && Number(pc.precio) > 0;
  }

  setField(field: 'idPlataforma' | 'idTipoContenido' | 'precio', value: string): void {
    this.nuevaPC.update(pc => ({ ...pc, [field]: value }));
  }

  agregar(): void {
    if (!this.canAgregar) return;
    const pc = this.nuevaPC();
    const existing = this.items();
    const isDuplicate = existing.some(
      e => e.idPlataforma === Number(pc.idPlataforma) && e.idTipoContenido === Number(pc.idTipoContenido)
    );
    if (isDuplicate) return;

    this.itemsChange.emit([
      ...existing,
      { idPlataforma: Number(pc.idPlataforma), idTipoContenido: Number(pc.idTipoContenido), precio: Number(pc.precio) }
    ]);
    this.nuevaPC.set({ idPlataforma: '', idTipoContenido: '', precio: '' });
  }

  eliminar(idx: number): void {
    this.itemsChange.emit(this.items().filter((_, i) => i !== idx));
  }

  getNombrePlataforma(id: number): string {
    return this.plataformas().find(p => p.idPlataforma === id)?.nombrePlataforma ?? '';
  }

  getNombreTipoContenido(id: number): string {
    return this.tiposContenido().find(t => t.idTipoContenido === id)?.nombre ?? '';
  }
}
