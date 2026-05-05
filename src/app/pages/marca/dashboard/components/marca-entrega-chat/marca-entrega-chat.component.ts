import {
  Component, input, inject, signal, computed, effect,
  OnChanges, SimpleChanges, ViewChild, ElementRef
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Campana,
  CampanaEntregable,
  ChatMensaje,
  EntregaInfluencer,
  EstadoEntrega,
  RevisionEntrega
} from '../../../../../models/types';
import { EntregaService } from '../../../../../services/entrega.service';
import { API_BASE_URL } from '../../../../../shared/constants';

interface EntregableConEntregas {
  idEntregable: number;
  descripcion: string;
  orden: number;
  influencers: InfluencerConHistorial[];
}

interface InfluencerConHistorial {
  idInfluencer: number;
  nombreSocialInfluencer: string;
  fotoPerfil: string | null;
  entregas: EntregaNormalizada[];
}

interface EntregaNormalizada {
  idEntregaInfluencer: number;
  idInfluencer: number;
  nombreSocialInfluencer: string;
  fotoPerfil: string | null;
  idEntregable: number;
  descripcionEntregable: string;
  estadoEntrega: EstadoEntrega;
  idEstadoEntrega: number;
  archivoUrl: string | null;
  comentario: string;
  fechaEntrega: string | null;
  fechaCreacion: string | null;
  revisiones: RevisionEntrega[];
}

@Component({
  selector: 'app-marca-entrega-chat',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './marca-entrega-chat.component.html'
})
export class MarcaEntregaChatComponent implements OnChanges {

  campana = input.required<Campana>();

  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef<HTMLDivElement>;

  readonly uploadsBase = API_BASE_URL.split('/api')[0];

  private entregaService = inject(EntregaService);

  entregables = signal<EntregableConEntregas[]>([]);
  loadingEntregas = signal(false);
  idEntregableActivo = signal<number | null>(null);
  idInfluencerActivo = signal<number | null>(null);
  procesando = signal(false);
  mostrarFormDevolucion = signal(false);
  comentarioDevolucion = signal('');
  errorAccion = signal<string | null>(null);
  imagenAmpliada = signal<string | null>(null);

  totalEntregas = computed(() =>
    this.entregables().reduce(
      (total, e) => total + e.influencers.reduce((subTotal, influencer) => subTotal + influencer.entregas.length, 0),
      0
    )
  );

  entregableActivo = computed(() => {
    const idActivo = this.idEntregableActivo();
    return this.entregables().find(e => e.idEntregable === idActivo) ?? null;
  });

  influencersDelEntregableActivo = computed(() =>
    this.entregableActivo()?.influencers ?? []
  );

  influencerActivo = computed(() => {
    const idInfluencer = this.idInfluencerActivo();
    if (idInfluencer == null) return null;
    return this.influencersDelEntregableActivo().find(i => i.idInfluencer === idInfluencer) ?? null;
  });

  entregaActiva = computed<EntregaNormalizada | null>(() => {
    const influencer = this.influencerActivo();
    if (!influencer) return null;
    return this.obtenerEntregaActual(influencer.entregas);
  });

  chatMensajes = computed<ChatMensaje[]>(() => this.construirChat(this.influencerActivo()));

  estadoActual = computed<EstadoEntrega | null>(() => {
    return this.entregaActiva()?.estadoEntrega ?? null;
  });

  puedeCambiarEstado = computed(() => this.estadoActual() === 'Enviada');

  constructor() {
    effect(() => {
      if (this.chatMensajes().length) {
        setTimeout(() => this.scrollToBottom(), 60);
      }
    });

    effect(() => {
      const campana = this.campana();
      if (campana) {
        this.cargarEntregas();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['campana']) {
      this.cargarEntregas();
    }
  }

  cargarEntregas(): void {
    this.loadingEntregas.set(true);

    const entregables = this.normalizarEntregables(this.campana().entregables ?? []);
    this.entregables.set(entregables);
    this.loadingEntregas.set(false);

    if (entregables.length === 0) {
      this.idEntregableActivo.set(null);
      this.idInfluencerActivo.set(null);
      return;
    }

    const idEntregableActual = this.idEntregableActivo();
    const entregableSeleccionado = entregables.find(e => e.idEntregable === idEntregableActual) ?? entregables[0];
    this.idEntregableActivo.set(entregableSeleccionado.idEntregable);

    const idInfluencerActual = this.idInfluencerActivo();
    const influencerSeleccionado = entregableSeleccionado.influencers.find(i => i.idInfluencer === idInfluencerActual)
      ?? entregableSeleccionado.influencers[0]
      ?? null;

    this.idInfluencerActivo.set(influencerSeleccionado?.idInfluencer ?? null);
  }

  seleccionarEntregable(entregable: EntregableConEntregas): void {
    this.idEntregableActivo.set(entregable.idEntregable);
    this.idInfluencerActivo.set(entregable.influencers[0]?.idInfluencer ?? null);
    this.mostrarFormDevolucion.set(false);
    this.comentarioDevolucion.set('');
    this.errorAccion.set(null);
  }

  seleccionarInfluencer(influencer: InfluencerConHistorial): void {
    this.idInfluencerActivo.set(influencer.idInfluencer);
    this.mostrarFormDevolucion.set(false);
    this.comentarioDevolucion.set('');
    this.errorAccion.set(null);
  }

  aprobar(): void {
    const entrega = this.entregaActiva();
    if (!entrega || this.procesando()) return;
    if (!confirm('¿Confirmás que querés aprobar esta entrega?')) return;

    this.procesando.set(true);
    this.errorAccion.set(null);
    this.entregaService.revisarEntrega(entrega.idEntregaInfluencer, { aprobada: true, comentario: 'Entrega aprobada' }).subscribe({
      next: () => {
        this.procesando.set(false);
        this.aplicarRevisionLocal(entrega.idEntregaInfluencer, true, 'Entrega aprobada');
      },
      error: () => {
        this.errorAccion.set('Error al aprobar la entrega. Intentá de nuevo.');
        this.procesando.set(false);
      }
    });
  }

  enviarDevolucion(): void {
    const entrega = this.entregaActiva();
    const comentario = this.comentarioDevolucion().trim();
    if (!entrega || !comentario || this.procesando()) return;

    this.procesando.set(true);
    this.errorAccion.set(null);
    this.entregaService.revisarEntrega(entrega.idEntregaInfluencer, { aprobada: false, comentario }).subscribe({
      next: () => {
        this.procesando.set(false);
        this.mostrarFormDevolucion.set(false);
        this.comentarioDevolucion.set('');
        this.aplicarRevisionLocal(entrega.idEntregaInfluencer, false, comentario);
      },
      error: () => {
        this.errorAccion.set('Error al enviar la devolución. Intentá de nuevo.');
        this.procesando.set(false);
      }
    });
  }

  esImagen(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(url);
  }

  abrirImagen(url: string): void {
    this.imagenAmpliada.set(url);
  }

  influencerActivoEs(influencer: InfluencerConHistorial): boolean {
    return this.idInfluencerActivo() === influencer.idInfluencer;
  }

  private normalizarEntregables(entregables: CampanaEntregable[]): EntregableConEntregas[] {
    return [...entregables]
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map((entregable) => {
        const entregasNormalizadas = (entregable.entregasPorInfluencer ?? [])
          .map((entrega) => this.normalizarEntrega(entrega, entregable))
          .sort((a, b) => this.getTimestamp(a) - this.getTimestamp(b));

        const mapaInfluencers = new Map<number, InfluencerConHistorial>();

        for (const entrega of entregasNormalizadas) {
          const existente = mapaInfluencers.get(entrega.idInfluencer);
          if (existente) {
            existente.entregas.push(entrega);
          } else {
            mapaInfluencers.set(entrega.idInfluencer, {
              idInfluencer: entrega.idInfluencer,
              nombreSocialInfluencer: entrega.nombreSocialInfluencer,
              fotoPerfil: entrega.fotoPerfil,
              entregas: [entrega]
            });
          }
        }

        const influencers = Array.from(mapaInfluencers.values())
          .map((influencer) => ({
            ...influencer,
            entregas: [...influencer.entregas].sort((a, b) => this.getTimestamp(a) - this.getTimestamp(b))
          }))
          .sort((a, b) => a.nombreSocialInfluencer.localeCompare(b.nombreSocialInfluencer));

        return {
          idEntregable: entregable.idEntregable,
          descripcion: entregable.descripcion,
          orden: entregable.orden,
          influencers
        };
      })
      .filter((entregable) => entregable.influencers.length > 0);
  }

  private normalizarEntrega(entrega: EntregaInfluencer, entregable: CampanaEntregable): EntregaNormalizada {
    const estado = this.resolverEstadoEntrega(entrega);

    return {
      idEntregaInfluencer: entrega.idEntregaInfluencer,
      idInfluencer: entrega.idInfluencer,
      nombreSocialInfluencer: entrega.nombreSocialInfluencer || `Influencer #${entrega.idInfluencer}`,
      fotoPerfil: entrega.fotoPerfil ?? null,
      idEntregable: entregable.idEntregable,
      descripcionEntregable: entregable.descripcion,
      estadoEntrega: estado,
      idEstadoEntrega: entrega.idEstadoEntrega ?? this.idDesdeEstado(estado),
      archivoUrl: entrega.archivoUrl ?? entrega.urlEntregable ?? null,
      comentario: entrega.comentario ?? entrega.comentarioInfluencer ?? '',
      fechaEntrega: entrega.fechaEntrega ?? entrega.fechaEnvio ?? null,
      fechaCreacion: entrega.fechaCreacion ?? null,
      revisiones: entrega.revisiones ?? []
    };
  }

  private resolverEstadoEntrega(entrega: EntregaInfluencer): EstadoEntrega {
    if (entrega.estadoEntrega) return entrega.estadoEntrega;

    const idEstado = entrega.idEstadoEntrega ?? entrega.estado;
    if (idEstado === 3) return 'Aprobada';
    if (idEstado === 4) return 'ConDevolucion';
    if (idEstado === 2) return 'Enviada';
    return 'Pendiente';
  }

  private idDesdeEstado(estado: EstadoEntrega): number {
    if (estado === 'Enviada') return 2;
    if (estado === 'Aprobada') return 3;
    if (estado === 'ConDevolucion') return 4;
    return 1;
  }

  private getTimestamp(entrega: EntregaNormalizada): number {
    const fecha = entrega.fechaEntrega || entrega.fechaCreacion;
    return fecha ? new Date(fecha).getTime() : 0;
  }

  private obtenerEntregaActual(entregas: EntregaNormalizada[]): EntregaNormalizada | null {
    if (!entregas.length) return null;
    const ordenadas = [...entregas].sort((a, b) => this.getTimestamp(a) - this.getTimestamp(b));
    return ordenadas[ordenadas.length - 1] ?? null;
  }

  private construirChat(influencer: InfluencerConHistorial | null): ChatMensaje[] {
    if (!influencer) return [];

    const mensajes: ChatMensaje[] = [];

    for (const entrega of influencer.entregas) {
      const fechaEnvio = entrega.fechaEntrega || entrega.fechaCreacion;

      if (entrega.archivoUrl || entrega.comentario || entrega.fechaEntrega) {
        mensajes.push({
          autor: 'Influencer',
          tipoMensaje: 'Envio',
          mensaje: entrega.comentario,
          archivoUrl: entrega.archivoUrl,
          fecha: fechaEnvio ?? new Date().toISOString(),
          estadoEntrega: entrega.estadoEntrega
        });
      }

      const revisionesOrdenadas = [...(entrega.revisiones ?? [])].sort((a, b) =>
        new Date(a.fechaRevision).getTime() - new Date(b.fechaRevision).getTime()
      );

      for (const revision of revisionesOrdenadas) {
        mensajes.push({
          autor: 'Marca',
          tipoMensaje: revision.esAprobacion ? 'Aprobacion' : 'Devolucion',
          mensaje: revision.comentario,
          archivoUrl: null,
          fecha: revision.fechaRevision,
          estadoEntrega: revision.esAprobacion ? 'Aprobada' : 'ConDevolucion'
        });
      }
    }

    return mensajes.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }

  private aplicarRevisionLocal(idEntregaInfluencer: number, aprobada: boolean, comentario: string): void {
    const fechaRevision = new Date().toISOString();

    this.entregables.update((entregables) =>
      entregables.map((entregable) => ({
        ...entregable,
        influencers: entregable.influencers.map((influencer) => ({
          ...influencer,
          entregas: influencer.entregas.map((entrega) => {
            if (entrega.idEntregaInfluencer !== idEntregaInfluencer) return entrega;

            return {
              ...entrega,
              estadoEntrega: aprobada ? 'Aprobada' : 'ConDevolucion',
              idEstadoEntrega: aprobada ? 3 : 4,
              revisiones: [
                ...(entrega.revisiones ?? []),
                {
                  idRevisionEntrega: Date.now(),
                  comentario,
                  esAprobacion: aprobada,
                  fechaRevision
                }
              ]
            };
          })
        }))
      }))
    );
  }

  private scrollToBottom(): void {
    const el = this.mensajesContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
