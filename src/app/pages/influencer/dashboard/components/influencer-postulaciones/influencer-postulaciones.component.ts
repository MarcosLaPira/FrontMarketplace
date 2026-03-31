import { Component, input } from '@angular/core';
import { Postulacion } from '../../../../../models/types';

@Component({
  selector: 'app-influencer-postulaciones',
  standalone: true,
  templateUrl: './influencer-postulaciones.component.html'
})
export class InfluencerPostulacionesComponent {
  postulaciones = input.required<Postulacion[]>();
}
