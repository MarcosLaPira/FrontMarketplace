

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Campana, Postulacion, InvitacionInfluencer, EntregaInfluencer } from '../../../../../models/types';
import { PostulacionService } from '../../../../../services/postulacion.service';
import { InvitacionService } from '../../../../../services/invitacion.service';
import { EntregaService } from '../../../../../services/entrega.service';
import { CampanaService } from '../../../../../services/campana.service';
import { CampanaDetailComponent } from '../../../../../components/campana-detail/campana-detail.component';
import { InfluencerCampanaCardComponent } from '../influencer-campana-card/influencer-campana-card.component';

import { EntregaHistorialService } from '../../../../../services/entrega-historial.service';

@Component({
  selector: 'app-influencer-postulaciones',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, CampanaDetailComponent, InfluencerCampanaCardComponent],
  templateUrl: './influencer-postulaciones.component.html'
})
export class InfluencerPostulacionesComponent implements OnInit {

    // ==================== CHAT DE ENTREGAS Y DEVOLUCIONES ====================


    enviandoMensaje = signal(false);

   enviarMensajeChat() {
    if (!this.nuevoMensaje().trim()) return;  // leer con ()
    this.enviandoMensaje.set(true);           // set() para escribir

    setTimeout(() => {
      this.chatMensajes.update(msgs => [
        ...msgs,
        {
          id: msgs.length + 1,
          autor: 'Yo',
          mensaje: this.nuevoMensaje(),        // leer con ()
          fecha: new Date(),
          esDevolucion: false
        }
      ]);
      this.nuevoMensaje.set('');              // set() para escribir
      this.enviandoMensaje.set(false);        // set() para escribir
    }, 500);
  }



  private postulacionService = inject(PostulacionService);
  private invitacionService = inject(InvitacionService);
  private entregaService = inject(EntregaService);
  private campanaService = inject(CampanaService);
  private fb = inject(FormBuilder);

  private entregaHistorialService = inject(EntregaHistorialService);

  activeSubTab = signal<'postulaciones' | 'invitaciones' | 'enCurso'>('postulaciones');

  postulaciones = signal<Postulacion[]>([]);
  loadingPostulaciones = signal(false);

  invitaciones = signal<InvitacionInfluencer[]>([]);
  loadingInvitaciones = signal(false);

  // En Curso
  campanasEnCurso = signal<Campana[]>([]);
  loadingEnCurso = signal(false);
  selectedCampanaId = signal<number | null>(null);
  entregas = signal<EntregaInfluencer[]>([]);
  loadingEntregas = signal(false);
  envioForms = signal<Record<number, FormGroup>>({});
  enviando = signal<Record<number, boolean>>({});
  enviado = signal<Record<number, boolean>>({});

  // Detalle de invitación
  selectedInvitacion = signal<InvitacionInfluencer | null>(null);
  respondiendo = signal<Record<number, boolean>>({});

  // Detalle de postulación
  selectedPostulacionCampanaId = signal<number | null>(null);

  // Historial de entregas
  historialEntrega = signal<any[] | null>(null);
  loadingHistorial = signal(false);
  modalHistorial = signal<{idEntregable: number, idInfluencer: number} | null>(null);

  totalPostulaciones = computed(() => this.postulaciones().length);
  invitacionesPendientes = computed(() =>
    this.invitaciones().filter(i => i.estadoInvitacionCampana.idEstadoInvitacionCampana === 1)
  );
  totalInvitaciones = computed(() => this.invitacionesPendientes().length);

  postulacionesAceptadas = computed(() =>
    this.postulaciones().filter(p => p.estado?.nombre?.toLowerCase() === 'aceptada')
  );

  ngOnInit(): void {
    this.loadPostulaciones();
    this.loadInvitaciones();
    this.loadCampanasEnCurso();
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
        // Solo mostramos invitaciones pendientes de respuesta (estado 1)
        const pendientes = data.filter(inv => inv.estadoInvitacionCampana.idEstadoInvitacionCampana === 1);
        this.invitaciones.set(pendientes);
        this.loadingInvitaciones.set(false);
      },
      error: () => this.loadingInvitaciones.set(false)
    });
  }

  loadCampanasEnCurso(): void {
    this.loadingEnCurso.set(true);
    this.campanaService.getCampanasEnCursoInfluencer().subscribe({
      next: (data) => {
        this.campanasEnCurso.set(data);
        this.loadingEnCurso.set(false); // <--- FALTABA ESTO
      },
      error: () => this.loadingEnCurso.set(false)
    });
  }

 seleccionarCampana(idCampana: number): void {
  this.selectedCampanaId.set(idCampana);
  this.cargarEntregas(idCampana);
}

cargarEntregas(idCampana: number): void {
  this.loadingEntregas.set(true);
  this.entregaService.getMisEntregasPorCampana(idCampana).subscribe({
    next: (data) => {
      this.entregas.set(data);
      this.loadingEntregas.set(false);
      // Cargar el chat automáticamente con el primer entregable
      if (data.length > 0) {
        this.cargarChat(data[0]);
      }
    },
    error: () => this.loadingEntregas.set(false)
  });
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
        const nuevoEstado = { ...inv.estadoInvitacionCampana, idEstadoInvitacionCampana: idEstado };
        this.invitaciones.update(list =>
          list.map(i => i.idInvitacionCampana === inv.idInvitacionCampana
            ? { ...i, estadoInvitacionCampana: nuevoEstado }
            : i)
        );
        this.selectedInvitacion.update(i =>
          i?.idInvitacionCampana === inv.idInvitacionCampana ? { ...i, estadoInvitacionCampana: nuevoEstado } : i
        );
        this.respondiendo.update(v => ({ ...v, [inv.idInvitacionCampana]: false }));
      },
      error: () => this.respondiendo.update(v => ({ ...v, [inv.idInvitacionCampana]: false }))
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

  getEstadoEntregaClass(estado: number): string {
    if (estado === 3) return 'bg-green-100 text-green-700 border border-green-200';
    if (estado === 2) return 'bg-blue-100 text-blue-700 border border-blue-200';
    if (estado === 4) return 'bg-orange-100 text-orange-700 border border-orange-200';
    return 'bg-amber-50 text-amber-700 border border-amber-200'; // pendiente
  }

  getEstadoEntregaLabel(estado: number): string {
    if (estado === 3) return 'Aprobada';
    if (estado === 2) return 'Enviada — en revisión';
    if (estado === 4) return 'Con devolución';
    return 'Pendiente';
  }

  puedeEnviar(estado: number): boolean {
    const s = estado;
    return s === 1 || s === 4;
  }

  getDaysLeft(fecha: string): number {
    const end = new Date(fecha);
    const now = new Date();
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

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

  verDetalleInvitacionPorCampana(idCampana: number): void {
    const inv = this.invitaciones().find(i => i.idCampana === idCampana);
    if (inv) this.verDetalleInvitacion(inv);
  }

  verDetallePostulacion(idCampana: number): void {
    this.selectedPostulacionCampanaId.set(idCampana);
  }

  volverDePostulacion(): void {
    this.selectedPostulacionCampanaId.set(null);
  }

  // === HISTORIAL DE ENTREGA ===
  abrirHistorialEntrega(entrega: EntregaInfluencer) {
    this.modalHistorial.set({ idEntregable: entrega.idEntregable, idInfluencer: entrega.idInfluencer });
    this.loadingHistorial.set(true);
    this.entregaHistorialService.getHistorialEntrega(entrega.idEntregable, entrega.idInfluencer).subscribe({
      next: (data) => {
        this.historialEntrega.set(data);
        this.loadingHistorial.set(false);
      },
      error: () => this.loadingHistorial.set(false)
    });
  }

  cerrarHistorialEntrega() {
    this.modalHistorial.set(null);
    this.historialEntrega.set(null);
  }





    // Reemplazar los signals del chat
  chatEntregaActiva = signal<EntregaInfluencer | null>(null);
  chatMensajes = signal<any[]>([]);
  loadingChat = signal(false);
  enviandoChat = signal(false);
  nuevoMensaje = signal('');
  archivoChat = signal<File | null>(null);

  // Reemplazar abrirHistorialEntrega
  abrirChat(entrega: EntregaInfluencer) {
    this.chatEntregaActiva.set(entrega);
    this.cargarChat(entrega);
  }

  cerrarChat() {
    this.chatEntregaActiva.set(null);
    this.chatMensajes.set([]);
    this.nuevoMensaje.set('');
    this.archivoChat.set(null);
  }

  cargarChat(entrega: EntregaInfluencer) {
    this.loadingChat.set(true);
    this.entregaHistorialService
      .getHistorialEntrega(entrega.idEntregable, entrega.idInfluencer)
      .subscribe({
        next: (data) => {
          this.chatMensajes.set(data);
          this.loadingChat.set(false);
        },
        error: () => this.loadingChat.set(false)
      });
  }


  enviarEntregaChat() {
    const entrega = this.chatEntregaActiva();
    if (!entrega || (!this.nuevoMensaje().trim() && !this.archivoChat())) return;

    this.enviandoChat.set(true);

    const formData = new FormData();
    formData.append('IdEntregable', entrega.idEntregable.toString());
    formData.append('Comentario', this.nuevoMensaje());
    if (this.archivoChat()) {
      formData.append('Archivo', this.archivoChat()!);
    }

    this.entregaService.enviarEntregaFormData(formData).subscribe({
      next: () => {
        this.nuevoMensaje.set('');
        this.archivoChat.set(null);
        this.cargarChat(entrega); // recargar el chat
        this.enviandoChat.set(false);
      },
      error: () => this.enviandoChat.set(false)
    });
  }




  imagenAmpliada = signal<string | null>(null);
  previewUrl = signal<string | null>(null);

  esImagen(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(url);
  }

  abrirImagen(url: string) {
    this.imagenAmpliada.set(url);
  }

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.archivoChat.set(file);
      // Generar preview si es imagen
      if (this.esImagen(file.name)) {
        const reader = new FileReader();
        reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        this.previewUrl.set(null);
      }
    }
  }



   public puedeEnviarMensaje = computed(() => {
    const mensajes = this.chatMensajes();
    if (!mensajes || mensajes.length === 0) return false;
    const ultimo = mensajes[mensajes.length - 1];
    // Puede ser string o número según API, ajustar si es necesario
    return (
      ultimo.estadoEntrega === 'Pendiente' ||
      ultimo.estadoEntrega === 'ConDevolucion' ||
      ultimo.estadoEntrega === 1 || // 1: Pendiente
      ultimo.estadoEntrega === 4    // 4: ConDevolucion
    );
  });



  // Permitir enviar archivo solo si el último mensaje del historial tiene estadoEntrega 'Pendiente' o 'ConDevolucion'
  public puedeEnviarArchivo = computed(() => {
    const mensajes = this.chatMensajes();
    if (!mensajes || mensajes.length === 0) return false;
    const ultimo = mensajes[mensajes.length - 1];
    return (
      ultimo.estadoEntrega === 'Pendiente' ||
      ultimo.estadoEntrega === 'ConDevolucion'
    );
  });
  // Permite enviar mensaje solo si el último mensaje tiene estadoEntrega 'Pendiente' o 'ConDevolucion'

}
