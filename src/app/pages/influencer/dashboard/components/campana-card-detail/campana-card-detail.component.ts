import { Component, input } from '@angular/core';
import { Campana } from '../../../../../models/types';

@Component({
  selector: 'app-campana-card-detail',
  standalone: true,
  imports: [],
  templateUrl: './campana-card-detail.component.html'
})
export class CampanaCardDetailComponent {
  campana = input.required<Campana>();

  getSpotsText(): string {
    const aceptados = this.campana().cantidadInfluencersAceptados ?? 0;
    const total = this.campana().cantidadInfluencers ?? 0;
    return `${Math.max(0, total - aceptados)} de ${total}`;
  }
}
