import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { EntregaInfluencer } from '../../../../../../models/types';
import { EntregaService } from '../../../../../../services/entrega.service';
import { EntregaHistorialService } from '../../../../../../services/entrega-historial.service';

/**
 * Componente de chat de entregas para una campaña en curso.
 * Gestiona toda la lógica de envío y visualización del historial de entregables.
 */
@Component({
  selector: 'app-entrega-chat',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './entrega-chat.component.html'
})
export class EntregaChatComponent implements OnInit, OnChanges {

  @Input({ required: true }) idCampana!: number;

  private entregaService = inject(EntregaService);
  private entregaHistorialService = inject(EntregaHistorialService);

  entregas = signal<EntregaInfluencer[]>([]);
  loadingEntregas = signal(false);
  chatMensajes = signal<any[]>([]);
  loadingChat = signal(false);
  enviandoChat = signal(false);
  nuevoMensaje = signal('');
  archivoChat = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  imagenAmpliada = signal<string | null>(null);

  private chatEntregaActiva = signal<EntregaInfluencer | null>(null);

  puedeEnviarArchivo = computed(() => {
    const mensajes = this.chatMensajes();
    if (!mensajes.length) return false;
    const ultimo = mensajes[mensajes.length - 1];
    return (
      ultimo.estadoEntrega === 'Pendiente' ||
      ultimo.estadoEntrega === 'ConDevolucion'
    );
  });

  ngOnInit(): void {
    this.cargarEntregas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idCampana'] && !changes['idCampana'].firstChange) {
      this.cargarEntregas();
    }
  }

  puedeEnviar(estado: number): boolean {
    return estado === 1 || estado === 4;
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
        this.previewUrl.set(null);
        this.cargarChat(entrega);
        this.enviandoChat.set(false);
      },
      error: () => this.enviandoChat.set(false)
    });
  }

  esImagen(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(url);
  }

  abrirImagen(url: string): void {
    this.imagenAmpliada.set(url);
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.archivoChat.set(file);
      if (this.esImagen(file.name)) {
        const reader = new FileReader();
        reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        this.previewUrl.set(null);
      }
    }
  }
}
