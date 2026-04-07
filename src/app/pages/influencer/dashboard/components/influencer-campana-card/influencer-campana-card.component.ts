import { Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Campana } from '../../../../../models/types';
import { CampanaCardDetailComponent } from '../campana-card-detail/campana-card-detail.component';

@Component({
  selector: 'app-influencer-campana-card',
  standalone: true,
  imports: [DatePipe, DecimalPipe, CampanaCardDetailComponent],
  templateUrl: './influencer-campana-card.component.html'
})
export class InfluencerCampanaCardComponent {
  campana = input.required<Campana>();
  viewMode = input.required<'grid' | 'list'>();
  expanded = input(false);
  hidePostular = input(false);

  verDetalle = output<number>();
  postularme = output<Campana>();
  toggleExpand = output<number>();

  getImagenUrl(): string | null {
    const imagenes = this.campana().imagenesProducto;
    if (imagenes?.length && imagenes[0].url) {
      return imagenes[0].url.startsWith('http') ? imagenes[0].url : `https://localhost:7070${imagenes[0].url}`;
    }
    return null;
  }

  getDaysLeft(): number {
    const end = new Date(this.campana().fechaFin);
    const now = new Date();
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  getSpotsText(): string {
    const aceptados = this.campana().cantidadInfluencersAceptados ?? 0;
    const total = this.campana().cantidadInfluencers ?? 0;
    return `${Math.max(0, total - aceptados)} de ${total}`;
  }

  getSpotsPercent(): number {
    const total = this.campana().cantidadInfluencers ?? 0;
    if (!total) return 0;
    return Math.round(((this.campana().cantidadInfluencersAceptados ?? 0) / total) * 100);
  }
}
