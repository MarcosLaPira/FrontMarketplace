import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Postulacion, InvitacionInfluencer, EntregaInfluencer } from '../../../../../models/types';
import { PostulacionService } from '../../../../../services/postulacion.service';
import { InvitacionService } from '../../../../../services/invitacion.service';
import { EntregaService } from '../../../../../services/entrega.service';
import { CampanaDetailComponent } from '../../../../../components/campana-detail/campana-detail.component';

@Component({
  selector: 'app-influencer-postulaciones',
  standalone: true,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, CampanaDetailComponent],
  templateUrl: './influencer-postulaciones.component.html'
})
export class InfluencerPostulacionesComponent implements OnInit {
  private postulacionService = inject(PostulacionService);
  private invitacionService = inject(InvitacionService);
  private entregaService = inject(EntregaService);
  private fb = inject(FormBuilder);

  activeSubTab = signal<'postulaciones' | 'invitaciones' | 'enCurso'>('postulaciones');

  postulaciones = signal<Postulacion[]>([]);
  loadingPostulaciones = signal(false);

  invitaciones = signal<InvitacionInfluencer[]>([]);
  loadingInvitaciones = signal(false);

  // En Curso
  selectedCampanaId = signal<number | null>(null);
  entregas = signal<EntregaInfluencer[]>([]);
  loadingEntregas = signal(false);
  envioForms = signal<Record<number, FormGroup>>({});
  enviando = signal<Record<number, boolean>>({});
  enviado = signal<Record<number, boolean>>({});

  // Detalle de invitación
  selectedInvitacion = signal<InvitacionInfluencer | null>(null);
  respondiendo = signal<Record<number, boolean>>({});

  totalPostulaciones = computed(() => this.postulaciones().length);
  totalInvitaciones = computed(() => this.invitaciones().length);

  postulacionesAceptadas = computed(() =>
    this.postulaciones().filter(p => p.estado?.nombre?.toLowerCase() === 'aceptada')
  );

  ngOnInit(): void {
    this.loadPostulaciones();
    this.loadInvitaciones();
  }

  loadPostulaciones(): void {
    this.loadingPostulaciones.set(true);
    this.postulacionService.getMisPostulaciones().subscribe({
      next: (data) => {
        this.postulaciones.set(data);
        this.loadingPostulaciones.set(false);
      },
      error: () => this.loadingPostulaciones.set(false)
    });
  }

  loadInvitaciones(): void {
    this.loadingInvitaciones.set(true);
    this.invitacionService.getMisInvitaciones().subscribe({
      next: (data) => {
        this.invitaciones.set(data);
        this.loadingInvitaciones.set(false);
      },
      error: () => this.loadingInvitaciones.set(false)
    });
  }

  seleccionarCampana(idCampana: number): void {
    this.selectedCampanaId.set(idCampana);
    this.cargarEntregas(idCampana);
  }

  volverAlListado(): void {
    this.selectedCampanaId.set(null);
    this.entregas.set([]);
    this.envioForms.set({});
    this.enviando.set({});
    this.enviado.set({});
  }

  verDetalleInvitacion(inv: InvitacionInfluencer): void {
    this.selectedInvitacion.set(inv);
  }

  volverDeInvitacion(): void {
    this.selectedInvitacion.set(null);
  }

  responderInvitacion(inv: InvitacionInfluencer, aceptar: boolean): void {
    this.respondiendo.update(v => ({ ...v, [inv.idInvitacionCampana]: true }));
    const idEstado = aceptar ? 2 : 3;
    this.invitacionService.responderInvitacion(inv.idInvitacionCampana, idEstado).subscribe({
      next: () => {
        const nuevoEstado = aceptar ? 'Aceptada' : 'Rechazada';
        this.invitaciones.update(list =>
          list.map(i => i.idInvitacionCampana === inv.idInvitacionCampana
            ? { ...i, estado: nuevoEstado }
            : i)
        );
        this.selectedInvitacion.update(i =>
          i?.idInvitacionCampana === inv.idInvitacionCampana ? { ...i, estado: nuevoEstado } : i
        );
        this.respondiendo.update(v => ({ ...v, [inv.idInvitacionCampana]: false }));
      },
      error: () => this.respondiendo.update(v => ({ ...v, [inv.idInvitacionCampana]: false }))
    });
  }

  cargarEntregas(idCampana: number): void {
    this.loadingEntregas.set(true);
    this.entregaService.getMisEntregasPorCampana(idCampana).subscribe({
      next: (data) => {
        this.entregas.set(data);
        this.inicializarFormularios(data);
        this.loadingEntregas.set(false);
      },
      error: () => this.loadingEntregas.set(false)
    });
  }

  private inicializarFormularios(entregas: EntregaInfluencer[]): void {
    const forms: Record<number, FormGroup> = {};
    const enviando: Record<number, boolean> = {};
    const enviado: Record<number, boolean> = {};
    for (const e of entregas) {
      forms[e.idEntregable] = this.fb.group({
        urlEntregable: [e.urlEntregable ?? '', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
        comentario: [e.comentarioInfluencer ?? '']
      });
      enviando[e.idEntregable] = false;
      enviado[e.idEntregable] = false;
    }
    this.envioForms.set(forms);
    this.enviando.set(enviando);
    this.enviado.set(enviado);
  }

  enviarEntrega(entrega: EntregaInfluencer): void {
    const form = this.envioForms()[entrega.idEntregable];
    if (!form || form.invalid) { form?.markAllAsTouched(); return; }

    this.enviando.update(v => ({ ...v, [entrega.idEntregable]: true }));

    this.entregaService.enviarEntrega({
      idEntregable: entrega.idEntregable,
      urlEntregable: form.value.urlEntregable,
      comentario: form.value.comentario || undefined
    }).subscribe({
      next: (updated) => {
        this.entregas.update(list =>
          list.map(e => e.idEntregaInfluencer === updated.idEntregaInfluencer ? updated : e)
        );
        this.enviado.update(v => ({ ...v, [entrega.idEntregable]: true }));
        this.enviando.update(v => ({ ...v, [entrega.idEntregable]: false }));
      },
      error: () => this.enviando.update(v => ({ ...v, [entrega.idEntregable]: false }))
    });
  }

  getEstadoClass(estado: string): string {
    const s = estado?.toLowerCase();
    if (s === 'aceptada' || s === 'aprobada') return 'bg-green-50 text-green-600 border-green-100';
    if (s === 'rechazada') return 'bg-red-50 text-red-600 border-red-100';
    if (s === 'pendiente') return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-gray-50 text-gray-600 border-gray-100';
  }

  getEstadoEntregaClass(estado: string): string {
    const s = estado?.toLowerCase();
    if (s === 'aprobada') return 'bg-green-100 text-green-700 border border-green-200';
    if (s === 'enviada') return 'bg-blue-100 text-blue-700 border border-blue-200';
    if (s === 'condevolucion') return 'bg-orange-100 text-orange-700 border border-orange-200';
    return 'bg-amber-50 text-amber-700 border border-amber-200'; // pendiente
  }

  getEstadoEntregaLabel(estado: string): string {
    const s = estado?.toLowerCase();
    if (s === 'aprobada') return 'Aprobada';
    if (s === 'enviada') return 'Enviada — en revisión';
    if (s === 'condevolucion') return 'Con devolución';
    return 'Pendiente';
  }

  puedeEnviar(estado: string): boolean {
    const s = estado?.toLowerCase();
    return s === 'pendiente' || s === 'condevolucion';
  }

  getDaysLeft(fecha: string): number {
    const end = new Date(fecha);
    const now = new Date();
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }
}
