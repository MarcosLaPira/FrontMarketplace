import {
  Component, input, inject, signal, computed, effect,
  OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Campana, ChatMensaje, EntregaInfluencer, EstadoEntrega } from '../../../../../models/types';
import { EntregaService } from '../../../../../services/entrega.service';
import { EntregaHistorialService } from '../../../../../services/entrega-historial.service';
import { API_BASE_URL } from '../../../../../shared/constants';

@Component({
  selector: 'app-marca-entrega-chat',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './marca-entrega-chat.component.html'
})
export class MarcaEntregaChatComponent implements OnInit, OnChanges {

  campana = input.required<Campana>();

  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef<HTMLDivElement>;

  readonly uploadsBase = API_BASE_URL.split('/api')[0];

  private entregaService = inject(EntregaService);
  private entregaHistorialService = inject(EntregaHistorialService);

  entregas = signal<EntregaInfluencer[]>([]);
  loadingEntregas = signal(false);
  entregaActiva = signal<EntregaInfluencer | null>(null);
  chatMensajes = signal<ChatMensaje[]>([]);
  loadingChat = signal(false);
  procesando = signal(false);
  mostrarFormDevolucion = signal(false);
  comentarioDevolucion = signal('');
  errorAccion = signal<string | null>(null);
  imagenAmpliada = signal<string | null>(null);

  estadoActual = computed<EstadoEntrega | null>(() => {
    const msgs = this.chatMensajes();
    return msgs.length ? msgs[msgs.length - 1].estadoEntrega : null;
  });

  puedeCambiarEstado = computed(() => this.estadoActual() === 'Enviada');

  constructor() {
    effect(() => {
      if (this.chatMensajes().length) {
        setTimeout(() => this.scrollToBottom(), 60);
      }
    });
  }

  ngOnInit(): void {
    this.cargarEntregas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['campana'] && !changes['campana'].firstChange) {
      this.cargarEntregas();
    }
  }

  cargarEntregas(): void {
    const idCampana = this.campana().idCampana;
    this.loadingEntregas.set(true);
    this.entregaService.getEntregasPorCampana(idCampana).subscribe({
      next: (data) => {
        this.entregas.set(data);
        this.loadingEntregas.set(false);
        if (data.length > 0) {
          this.seleccionarEntrega(data[0]);
        }
      },
      error: () => this.loadingEntregas.set(false)
    });
  }

  seleccionarEntrega(entrega: EntregaInfluencer): void {
    this.entregaActiva.set(entrega);
    this.mostrarFormDevolucion.set(false);
    this.comentarioDevolucion.set('');
    this.errorAccion.set(null);
    this.cargarChat(entrega);
  }

  cargarChat(entrega: EntregaInfluencer): void {
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

  aprobar(): void {
    const entrega = this.entregaActiva();
    if (!entrega || this.procesando()) return;
    if (!confirm('¿Confirmás que querés aprobar esta entrega?')) return;

    this.procesando.set(true);
    this.errorAccion.set(null);
    this.entregaService.revisarEntrega(entrega.idEntregaInfluencer, { aprobada: true, comentario: 'Entrega aprobada' }).subscribe({
      next: () => {
        this.procesando.set(false);
        this.cargarEntregas();
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
        this.cargarEntregas();
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

  private scrollToBottom(): void {
    const el = this.mensajesContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
