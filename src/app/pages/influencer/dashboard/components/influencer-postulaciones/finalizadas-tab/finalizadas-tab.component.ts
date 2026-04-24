import { Component, Input, output } from '@angular/core';
import { Campana } from '../../../../../../models/types';
import { InfluencerCampanaCardComponent } from '../../influencer-campana-card/influencer-campana-card.component';

@Component({
  selector: 'app-finalizadas-tab',
  standalone: true,
  imports: [InfluencerCampanaCardComponent],
  templateUrl: './finalizadas-tab.component.html'
})
export class FinalizadasTabComponent {

  @Input({ required: true }) campanasFinalizadas: Campana[] = [];
  @Input({ required: true }) loading = false;

  seleccionar = output<number>();

  /** Estado 6 = Finalizada (aprobada), Estado 7 = Cancelada */
  esFinalizada(campana: Campana): boolean {
    return campana.estadoCampana?.idEstadoCampana === 6;
  }

  esCancelada(campana: Campana): boolean {
    return campana.estadoCampana?.idEstadoCampana === 7;
  }
}
