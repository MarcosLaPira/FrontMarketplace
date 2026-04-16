import { Component, Input, output } from '@angular/core';
import { Campana, InvitacionInfluencer } from '../../../../../../models/types';
import { InfluencerCampanaCardComponent } from '../../influencer-campana-card/influencer-campana-card.component';

/**
 * Tab de invitaciones del influencer.
 * Recibe la lista de invitaciones y el estado de "respondiendo".
 * Emite eventos para responder y para ver detalle sin gestionar servicios directamente.
 */
@Component({
  selector: 'app-invitaciones-tab',
  standalone: true,
  imports: [InfluencerCampanaCardComponent],
  templateUrl: './invitaciones-tab.component.html'
})
export class InvitacionesTabComponent {

  @Input({ required: true }) invitaciones: InvitacionInfluencer[] = [];
  @Input({ required: true }) loading = false;
  @Input({ required: true }) respondiendo: Record<number, boolean> = {};

  responder = output<{ inv: InvitacionInfluencer; aceptar: boolean }>();
  verDetalle = output<number>();

  invitacionToCampana(inv: InvitacionInfluencer): Campana {
    return {
      idCampana: inv.campana.idCampana,
      titulo: inv.campana.titulo,
      descripcion: inv.campana.descripcion,
      presupuesto: inv.campana.presupuesto,
      fechaInicio: new Date(inv.campana.fechaInicio),
      fechaFin: new Date(inv.campana.fechaFin),
      marca: inv.campana.marca?.nombreComercial,
      plataforma: inv.campana.plataforma
    };
  }
}
