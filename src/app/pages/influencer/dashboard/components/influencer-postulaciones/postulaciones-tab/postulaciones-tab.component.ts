import { Component, Input, output } from '@angular/core';
import { Postulacion } from '../../../../../../models/types';
import { InfluencerCampanaCardComponent } from '../../influencer-campana-card/influencer-campana-card.component';

/**
 * Tab de postulaciones del influencer.
 * Recibe la lista de postulaciones y emite el id de campaña al ver detalle.
 */
@Component({
  selector: 'app-postulaciones-tab',
  standalone: true,
  imports: [InfluencerCampanaCardComponent],
  templateUrl: './postulaciones-tab.component.html'
})
export class PostulacionesTabComponent {

  @Input({ required: true }) postulaciones: Postulacion[] = [];
  @Input({ required: true }) loading = false;

  verDetalle = output<number>();
}
