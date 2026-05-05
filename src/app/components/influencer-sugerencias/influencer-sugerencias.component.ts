import { Component, inject, input, output, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Influencer } from '../../models/types';
import { InfluencerService } from '../../services/influencer.service';
import { InfluencerCardComponent } from '../influencer-card/influencer-card.component';

@Component({
  selector: 'app-influencer-sugerencias',
  standalone: true,
  imports: [InfluencerCardComponent, DecimalPipe],
  templateUrl: './influencer-sugerencias.component.html'
})
export class InfluencerSugerenciasComponent implements OnInit {
  private influencerService = inject(InfluencerService);

  // Filtros provenientes del contexto (form o campaña existente)
  idsCategorias    = input<number[]>([]);
  seguidoresMin    = input<number | null>(null);
  seguidoresMax    = input<number | null>(null);
  presupuestoPorInfluencer = input<number | null>(null);
  excluirIds       = input<number[]>([]);   // ya invitados — no mostrar
  cantidadCupos    = input<number | null>(null); // para el mensaje de contexto

  invitar = output<Influencer>();

  cargando  = signal(false);
  resultado = signal<Influencer[]>([]);
  error     = signal<string | null>(null);
  pagina    = signal(1);
  hayMas    = signal(false);
  readonly PAGE_SIZE = 6;

  sugerenciasFiltradas = computed(() =>
    this.resultado().filter(inf => !this.excluirIds().includes(inf.idInfluencer))
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(append = false): void {
    if (!append) {
      this.cargando.set(true);
      this.resultado.set([]);
      this.error.set(null);
      this.pagina.set(1);
    } else {
      this.cargando.set(true);
    }

    const filtros: Record<string, any> = {
      page: append ? this.pagina() : 1,
      pageSize: this.PAGE_SIZE
    };

    const cats = this.idsCategorias();
    if (cats.length) filtros['idsCategorias'] = cats;

    const segMin = this.seguidoresMin();
    if (segMin != null && segMin > 0) filtros['seguidoresMin'] = segMin;

    const segMax = this.seguidoresMax();
    if (segMax != null) filtros['seguidoresMax'] = segMax;

    const ppi = this.presupuestoPorInfluencer();
    if (ppi != null && ppi > 0) {
      // Usar el presupuesto/influencer como costoMax orientativo
      filtros['costoMax'] = ppi;
    }

    this.influencerService.getInfluencers(filtros).subscribe({
      next: (res) => {
        const items = res.items ?? [];
        this.resultado.set(append ? [...this.resultado(), ...items] : items);
        this.hayMas.set(items.length === this.PAGE_SIZE);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las sugerencias.');
        this.cargando.set(false);
      }
    });
  }

  cargarMas(): void {
    this.pagina.update(p => p + 1);
    this.cargar(true);
  }

  onInvitar(inf: Influencer): void {
    this.invitar.emit(inf);
  }
}
