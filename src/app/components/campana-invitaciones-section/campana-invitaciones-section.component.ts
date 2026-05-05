import { Component, inject, input, output, signal } from '@angular/core';
import { Influencer, InvitacionInput } from '../../models/types';
import { InfluencerService } from '../../services/influencer.service';

interface InvitacionDisplay {
  idInfluencer: number;
  nombreSocial: string;
  mensaje: string;
}

@Component({
  selector: 'app-campana-invitaciones-section',
  standalone: true,
  imports: [],
  templateUrl: './campana-invitaciones-section.component.html'
})
export class CampanaInvitacionesSectionComponent {
  private influencerService = inject(InfluencerService);

  items = input<InvitacionDisplay[]>([]);
  itemsChange = output<InvitacionDisplay[]>();

  buscarNombre = signal('');
  resultados = signal<Array<{ idInfluencer: number; nombreSocial: string }>>([]);
  seleccionado = signal<{ idInfluencer: number; nombreSocial: string } | null>(null);
  mensaje = signal('');
  buscando = signal(false);
  error = signal('');

  buscar(): void {
    const nombre = this.buscarNombre().trim();
    if (!nombre) return;

    this.buscando.set(true);
    this.error.set('');
    this.resultados.set([]);
    this.seleccionado.set(null);

    this.influencerService.getInfluencers({ search: nombre }).subscribe({
      next: (res) => {
        const filtrados = (res.items || [])
          .filter((i: Influencer) => !this.items().some(inv => inv.idInfluencer === i.idInfluencer))
          .map((i: Influencer) => ({ idInfluencer: i.idInfluencer, nombreSocial: i.nombreSocial }));
        this.resultados.set(filtrados);
        if (filtrados.length === 0) this.error.set('No se encontraron influencers con ese nombre.');
        this.buscando.set(false);
      },
      error: () => {
        this.error.set('Error al buscar influencers.');
        this.buscando.set(false);
      }
    });
  }

  seleccionar(inf: { idInfluencer: number; nombreSocial: string }): void {
    this.seleccionado.set(inf);
    this.resultados.set([]);
    this.error.set('');
  }

  agregar(): void {
    const inf = this.seleccionado();
    if (!inf) return;
    if (this.items().some(i => i.idInfluencer === inf.idInfluencer)) return;

    this.itemsChange.emit([
      ...this.items(),
      { idInfluencer: inf.idInfluencer, nombreSocial: inf.nombreSocial, mensaje: this.mensaje() }
    ]);
    this.buscarNombre.set('');
    this.seleccionado.set(null);
    this.resultados.set([]);
    this.mensaje.set('');
    this.error.set('');
  }

  eliminar(idx: number): void {
    this.itemsChange.emit(this.items().filter((_, i) => i !== idx));
  }
}
