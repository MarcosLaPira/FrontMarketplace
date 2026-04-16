import { Component, Input, output } from '@angular/core';
import { Campana } from '../../../../../../models/types';
import { InfluencerCampanaCardComponent } from '../../influencer-campana-card/influencer-campana-card.component';

/**
 * Tab de campañas en curso del influencer.
 * Recibe la lista de campañas activas y emite el id al seleccionar una.
 */
@Component({
  selector: 'app-en-curso-tab',
  standalone: true,
  imports: [InfluencerCampanaCardComponent],
  templateUrl: './en-curso-tab.component.html'
})
export class EnCursoTabComponent {

  @Input({ required: true }) campanasEnCurso: Campana[] = [];
  @Input({ required: true }) loading = false;

  seleccionar = output<number>();
}
