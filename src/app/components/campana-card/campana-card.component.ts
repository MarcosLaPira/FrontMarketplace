import { Component, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Campana } from '../../models/types';

@Component({
  selector: 'app-campana-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './campana-card.component.html'
})
export class CampanaCardComponent {
  campana = input.required<Campana>();
  showActions = input(false);
  isPast = input(false);

  editClicked = output<Campana>();
  deleteClicked = output<number>();
  togglePostulaciones = output<number>();

  expanded = signal(false);

  get estadoNombre(): string {
    return this.campana().estadoCampana?.nombre ?? '';
  }

  get estadoColor(): string {
    const id = this.campana().estadoCampana?.idEstadoCampana;
    switch (id) {
      case 1: return 'bg-green-100 text-green-800';   // Publicada
      case 6: return 'bg-gray-100 text-gray-600';     // Finalizada
      case 7: return 'bg-red-100 text-red-800';       // Cancelada
      default: return 'bg-blue-100 text-blue-800';
    }
  }

  get influencersCompletos(): boolean {
    return (this.campana().cantidadInfluencersAceptados ?? 0) >= (this.campana().cantidadInfluencers ?? 0);
  }

  get imagenProductoUrl(): string | null {
    const imagenes = this.campana().imagenesProducto;
    if (imagenes && imagenes.length > 0 && imagenes[0].url) {
      // Si la URL es relativa, anteponer el dominio si hace falta
      return imagenes[0].url.startsWith('http') ? imagenes[0].url : `https://localhost:7070${imagenes[0].url}`;
    }
    return null;
  }
}
