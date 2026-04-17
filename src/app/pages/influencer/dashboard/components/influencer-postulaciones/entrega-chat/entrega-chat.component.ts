import {
  Component, Input, OnInit, OnChanges, SimpleChanges,
  inject, signal, computed, ViewChild, ElementRef, effect
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ChatMensaje, EntregaInfluencer, EstadoEntrega } from '../../../../../../models/types';
import { EntregaService } from '../../../../../../services/entrega.service';
import { EntregaHistorialService } from '../../../../../../services/entrega-historial.service';
import { API_BASE_URL } from '../../../../../../shared/constants';

@Component({
  selector: 'app-entrega-chat',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './entrega-chat.component.html'
})
export class EntregaChatComponent implements OnInit, OnChanges {

  @Input({ required: true }) idCampana!: number;
  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef<HTMLDivElement>;

  readonly uploadsBase = API_BASE_URL.split('/api')[0];

  private entregaService = inject(EntregaService);
  private entregaHistorialService = inject(EntregaHistorialService);

  entregas = signal<EntregaInfluencer[]>([]);
  loadingEntregas = signal(false);
  chatMensajes = signal<ChatMensaje[]>([]);
  loadingChat = signal(false);
  enviandoChat = signal(false);
  nuevoMensaje = signal('');
  archivoChat = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  imagenAmpliada = signal<string | null>(null);
  errorEnvio = signal<string | null>(null);

  private chatEntregaActiva = signal<EntregaInfluencer | null>(null);

  estadoActual = computed<EstadoEntrega | null>(() => {
    const msgs = this.chatMensajes();
    return msgs.length ? msgs[msgs.length - 1].estadoEntrega : null;
  });

  puedeEnviarEntrega = computed(() => {
    const estado = this.estadoActual();
    // Si el historial está vacío, es el primer envío del influencer (turno pendiente)
    if (!estado && this.chatMensajes().length === 0 && !this.loadingChat()) return true;
    return estado === 'Pendiente' || estado === 'ConDevolucion';
  });

  ultimaDevolucion = computed<ChatMensaje | null>(() => {
    const msgs = this.chatMensajes();
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].tipoMensaje === 'Devolucion') return msgs[i];
    }
    return null;
  });

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
    if (changes['idCampana'] && !changes['idCampana'].firstChange) {
      this.cargarEntregas();
    }
  }

  cargarEntregas(): void {
    this.loadingEntregas.set(true);
    this.entregaService.getMisEntregasPorCampana(this.idCampana).subscribe({
      next: (data) => {
        this.entregas.set(data);
        this.loadingEntregas.set(false);
        if (data.length > 0) {
          this.chatEntregaActiva.set(data[0]);
          this.cargarChat(data[0]);
        }
      },
      error: () => this.loadingEntregas.set(false)
    });
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

  enviarEntregaChat(): void {
    const entrega = this.chatEntregaActiva();
    if (!entrega || !this.archivoChat() || this.enviandoChat()) return;

    this.errorEnvio.set(null);
    this.enviandoChat.set(true);

    const formData = new FormData();
    formData.append('IdEntregable', entrega.idEntregable.toString());
    formData.append('Archivo', this.archivoChat()!);
    const comentario = this.nuevoMensaje().trim();
    if (comentario) formData.append('Comentario', comentario);

    this.entregaService.enviarEntregaFormData(formData).subscribe({
      next: () => {
        this.nuevoMensaje.set('');
        this.archivoChat.set(null);
        this.previewUrl.set(null);
        this.enviandoChat.set(false);
        this.cargarChat(entrega);
      },
      error: () => {
        this.errorEnvio.set('Hubo un error al enviar la entrega. Intentá de nuevo.');
        this.enviandoChat.set(false);
      }
    });
  }

  quitarArchivo(): void {
    this.archivoChat.set(null);
    this.previewUrl.set(null);
  }

  esImagen(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(url);
  }

  abrirImagen(url: string): void {
    this.imagenAmpliada.set(url);
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.archivoChat.set(file);
    if (this.esImagen(file.name)) {
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      this.previewUrl.set(null);
    }
    // reset input para permitir re-seleccionar el mismo archivo
    input.value = '';
  }

  private scrollToBottom(): void {
    this.mensajesContainer?.nativeElement?.scrollTo({
      top: this.mensajesContainer.nativeElement.scrollHeight,
      behavior: 'smooth'
    });
  }
}
