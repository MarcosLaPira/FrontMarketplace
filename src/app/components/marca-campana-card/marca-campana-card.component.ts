import { Component, input, output, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Campana } from '../../models/types';

@Component({
  selector: 'app-marca-campana-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './marca-campana-card.component.html'
})
export class MarcaCampanaCardComponent {
  campana = input.required<Campana>();
  isPast = input(false);
  showActions = input(true);
  isExpanded = input(false);

  editClicked = output<Campana>();
  deleteClicked = output<number>();
  invitarClicked = output<number>();
  detalleClicked = output<number>();

  postulacionesPendientes = computed(() =>
    this.campana().postulaciones?.filter(p => p.idEstadoPostulacion === 1).length ?? 0
  );

  tieneAccionRequerida = computed(() => this.postulacionesPendientes() > 0);

  get estadoNombre(): string {
    return this.campana().estadoCampana?.nombre ?? '';
  }

  get estadoBadgeClass(): string {
    const id = this.campana().estadoCampana?.idEstadoCampana;
    switch (id) {
      case 1: return 'bg-emerald-100/90 text-emerald-900 border border-emerald-300/50';
      case 6: return 'bg-white/90 text-gray-600 border border-gray-300/50';
      case 7: return 'bg-red-100/90 text-red-900 border border-red-300/50';
      default: return 'bg-blue-100/90 text-blue-900 border border-blue-300/50';
    }
  }

  get progresoInfluencers(): number {
    const aceptados = this.campana().cantidadInfluencersAceptados ?? 0;
    const total = this.campana().cantidadInfluencers ?? 1;
    return Math.min(100, Math.round((aceptados / total) * 100));
  }

  get influencersCompletos(): boolean {
    return (this.campana().cantidadInfluencersAceptados ?? 0) >= (this.campana().cantidadInfluencers ?? 1);
  }

  get imagenProductoUrl(): string | null {
    const imagenes = this.campana().imagenesProducto;
    if (imagenes && imagenes.length > 0 && imagenes[0].url) {
      return imagenes[0].url.startsWith('http') ? imagenes[0].url : `https://localhost:7070${imagenes[0].url}`;
    }
    return null;
  }

  get diasRestantes(): number {
    const fin = new Date(this.campana().fechaFin);
    const hoy = new Date();
    return Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  get esPublicada(): boolean {
    return this.campana().estadoCampana?.idEstadoCampana === 1;
  }
}
