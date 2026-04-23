

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Campana, InvitacionInfluencer, Postulacion } from '../../../../../models/types';
import { PostulacionService } from '../../../../../services/postulacion.service';
import { InvitacionService } from '../../../../../services/invitacion.service';
import { CampanaService } from '../../../../../services/campana.service';
import { CampanaDetailComponent } from '../../../../../components/campana-detail/campana-detail.component';
import { PostulacionesTabComponent } from './postulaciones-tab/postulaciones-tab.component';
import { InvitacionesTabComponent } from './invitaciones-tab/invitaciones-tab.component';
import { EnCursoTabComponent } from './en-curso-tab/en-curso-tab.component';
import { EntregaChatComponent } from './entrega-chat/entrega-chat.component';

@Component({
  selector: 'app-influencer-postulaciones',
  standalone: true,
  imports: [
    CampanaDetailComponent,
    PostulacionesTabComponent,
    InvitacionesTabComponent,
    EnCursoTabComponent,
    EntregaChatComponent
  ],
  templateUrl: './influencer-postulaciones.component.html'
})
export class InfluencerPostulacionesComponent implements OnInit {

  private postulacionService = inject(PostulacionService);
  private invitacionService = inject(InvitacionService);
  private campanaService = inject(CampanaService);

  // ==================== Estado de navegaciÃ³n ====================

  activeSubTab = signal<'postulaciones' | 'invitaciones' | 'enCurso'>('postulaciones');

  /** Determina si se estÃ¡ mostrando una vista de detalle (oculta la lista principal). */
  isDetalleVisible = computed(() =>
    (this.activeSubTab() === 'enCurso' && !!this.selectedCampanaId()) ||
    (this.activeSubTab() === 'invitaciones' && !!this.selectedInvitacion()) ||
    (this.activeSubTab() === 'postulaciones' && !!this.selectedPostulacionCampanaId())
  );

  // ==================== Postulaciones ====================

  postulaciones = signal<Postulacion[]>([]);
  loadingPostulaciones = signal(false);
  selectedPostulacionCampanaId = signal<number | null>(null);
  totalPostulaciones = computed(() => this.postulaciones().length);

  // ==================== Invitaciones ====================

  invitaciones = signal<InvitacionInfluencer[]>([]);
  loadingInvitaciones = signal(false);
  respondiendo = signal<Record<number, boolean>>({});
  selectedInvitacion = signal<InvitacionInfluencer | null>(null);
  totalInvitaciones = computed(() => this.invitaciones().length);

  // ==================== En Curso ====================

  campanasEnCurso = signal<Campana[]>([]);
  loadingEnCurso = signal(false);
  selectedCampanaId = signal<number | null>(null);

  // ==================== Ciclo de vida ====================

  ngOnInit(): void {
    this.loadPostulaciones();
    this.loadInvitaciones();
    this.loadCampanasEnCurso();
  }

  // ==================== Carga de datos ====================

  private loadPostulaciones(): void {
    this.loadingPostulaciones.set(true);
    this.postulacionService.getMisPostulaciones().subscribe({
      next: (data) => { this.postulaciones.set(data); this.loadingPostulaciones.set(false); },
      error: () => this.loadingPostulaciones.set(false)
    });
  }

  private loadInvitaciones(): void {
    this.loadingInvitaciones.set(true);
    this.invitacionService.getMisInvitaciones().subscribe({
      next: (data) => {
        // Solo se muestran las pendientes de respuesta (estado 1)
        this.invitaciones.set(data.filter(inv => inv.estadoInvitacionCampana.idEstadoInvitacionCampana === 1));
        this.loadingInvitaciones.set(false);
      },
      error: () => this.loadingInvitaciones.set(false)
    });
  }

  private loadCampanasEnCurso(): void {
    this.loadingEnCurso.set(true);
    this.campanaService.getCampanasEnCursoInfluencer().subscribe({
      next: (data) => { this.campanasEnCurso.set(data); this.loadingEnCurso.set(false); },
      error: () => this.loadingEnCurso.set(false)
    });
  }

  // ==================== NavegaciÃ³n: Postulaciones ====================

  verDetallePostulacion(idCampana: number): void {
    this.selectedPostulacionCampanaId.set(idCampana);
  }

  volverDePostulacion(): void {
    this.selectedPostulacionCampanaId.set(null);
  }

  // ==================== NavegaciÃ³n: Invitaciones ====================

  verDetalleInvitacionPorCampana(idCampana: number): void {
    const inv = this.invitaciones().find(i => i.idCampana === idCampana);
    if (inv) this.selectedInvitacion.set(inv);
  }

  volverDeInvitacion(): void {
    this.selectedInvitacion.set(null);
  }

  responderInvitacion(inv: InvitacionInfluencer, aceptar: boolean): void {
    this.respondiendo.update(v => ({ ...v, [inv.idInvitacionCampana]: true }));
    const idEstado = aceptar ? 2 : 3;
    this.invitacionService.responderInvitacion(inv.idInvitacionCampana, idEstado).subscribe({
      next: () => {
        this.respondiendo.update(v => ({ ...v, [inv.idInvitacionCampana]: false }));
        this.selectedInvitacion.set(null);
        this.loadInvitaciones();
        if (aceptar) {
          this.loadCampanasEnCurso();
        }
      },
      error: () => this.respondiendo.update(v => ({ ...v, [inv.idInvitacionCampana]: false }))
    });
  }

  // ==================== NavegaciÃ³n: En Curso ====================

  seleccionarCampana(idCampana: number): void {
    this.selectedCampanaId.set(idCampana);
  }

  volverAlListado(): void {
    this.selectedCampanaId.set(null);
  }

}

