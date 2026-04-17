import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Campana } from '../../../../../models/types';

@Component({
  selector: 'app-campana-card-detail',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './campana-card-detail.component.html'
})
export class CampanaCardDetailComponent {
  campana = input.required<Campana>();

  onload() {
    console.log("te muestro", this.campana());
  }

  getSpotsText(): string {
    const aceptados = this.campana().cantidadInfluencersAceptados ?? 0;
    const total = this.campana().cantidadInfluencers ?? 0;
    return `${Math.max(0, total - aceptados)} de ${total}`;
  }
}
