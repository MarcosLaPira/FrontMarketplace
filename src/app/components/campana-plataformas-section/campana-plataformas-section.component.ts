import { Component, OnInit, input, output, signal } from '@angular/core';
import { Plataforma, TipoContenido, PlataformaContenidoInput } from '../../models/types';

@Component({
  selector: 'app-campana-plataformas-section',
  standalone: true,
  imports: [],
  templateUrl: './campana-plataformas-section.component.html'
})
export class CampanaPlataformasSectionComponent implements OnInit {
  plataformas = input.required<Plataforma[]>();
  tiposContenido = input.required<TipoContenido[]>();
  precioSugerido = input<number | null>(null);
  items = input<PlataformaContenidoInput[]>([]);

  itemsChange = output<PlataformaContenidoInput[]>();

  seleccion = signal<{ idPlataforma: string; idTipoContenido: string }>({
    idPlataforma: '', idTipoContenido: ''
  });

  ngOnInit(): void {
    const first = this.items()[0];
    if (!first) return;
    this.seleccion.set({
      idPlataforma: String(first.idPlataforma),
      idTipoContenido: String(first.idTipoContenido)
    });
  }

  setField(field: 'idPlataforma' | 'idTipoContenido', value: string): void {
    this.seleccion.update(sel => ({ ...sel, [field]: value }));
    this.emitSeleccion();
  }

  limpiar(): void {
    this.seleccion.set({ idPlataforma: '', idTipoContenido: '' });
    this.itemsChange.emit([]);
  }

  private emitSeleccion(): void {
    const sel = this.seleccion();
    if (!sel.idPlataforma || !sel.idTipoContenido) {
      this.itemsChange.emit([]);
      return;
    }

    this.itemsChange.emit([
      {
        idPlataforma: Number(sel.idPlataforma),
        idTipoContenido: Number(sel.idTipoContenido),
        precio: this.precioSugerido() ?? 0
      }
    ]);
  }

  getNombrePlataforma(id: number): string {
    return this.plataformas().find(p => p.idPlataforma === id)?.nombrePlataforma ?? '';
  }

  getNombreTipoContenido(id: number): string {
    return this.tiposContenido().find(t => t.idTipoContenido === id)?.nombre ?? '';
  }
}
