import { Component, input, output, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Campana, Influencer } from '../../models/types';
import { API_BASE_URL } from '../../shared/constants';

@Component({
  selector: 'app-invitar-influencer-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './invitar-influencer-modal.component.html'
})
export class InvitarInfluencerModalComponent {
  influencer = input.required<Influencer>();
  campanas = input.required<Campana[]>();
  campanaIdInicial = input<number | null>(null);

  confirmado = output<{ idCampana: number; mensaje: string }>();
  cerrado = output<void>();

  campanaSeleccionadaId = signal<number | null>(null);
  mensaje = signal<string>('');
  enviando = signal<boolean>(false);

  canConfirmar = computed(() => this.campanaSeleccionadaId() !== null);

  constructor() {
    effect(() => {
      const id = this.campanaIdInicial();
      if (id !== null) {
        this.campanaSeleccionadaId.set(id);
      }
    });
  }

  get fotoPerfilUrl(): string | null {
    const foto = this.influencer().fotoPerfil;
    if (!foto) return null;
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${foto}`;
  }

  get initials(): string {
    return this.influencer().nombreSocial
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  seleccionarCampana(id: number): void {
    this.campanaSeleccionadaId.set(this.campanaSeleccionadaId() === id ? null : id);
  }

  confirmar(): void {
    const idCampana = this.campanaSeleccionadaId();
    if (!idCampana) return;
    this.confirmado.emit({ idCampana, mensaje: this.mensaje() });
  }

  cerrar(): void {
    this.cerrado.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrar();
    }
  }
}
