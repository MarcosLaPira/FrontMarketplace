import { Component, inject, input, output, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Influencer, InvitacionInput } from '../../models/types';
import { InfluencerService } from '../../services/influencer.service';
import { InfluencerSugerenciasComponent } from '../influencer-sugerencias/influencer-sugerencias.component';

interface InvitacionDisplay {
  idInfluencer: number;
  nombreSocial: string;
  mensaje: string;
}

@Component({
  selector: 'app-campana-invitaciones-section',
  standalone: true,
  imports: [InfluencerSugerenciasComponent],
  templateUrl: './campana-invitaciones-section.component.html'
})
export class CampanaInvitacionesSectionComponent implements OnInit, OnDestroy {
  private influencerService = inject(InfluencerService);

  items = input<InvitacionDisplay[]>([]);
  itemsChange = output<InvitacionDisplay[]>();

  // Filtros del contexto (vienen del form padre)
  idsCategorias            = input<number[]>([]);
  minimoSeguidores         = input<number | null>(null);
  presupuestoPorInfluencer = input<number | null>(null);
  cantidadInfluencers      = input<number | null>(null);

  buscarNombre = signal('');
  resultados = signal<Array<{ idInfluencer: number; nombreSocial: string }>>([]);
  seleccionado = signal<{ idInfluencer: number; nombreSocial: string } | null>(null);
  mensaje = signal('');
  buscando = signal(false);
  error = signal('');
  mostrarSugerencias = signal(false);
  mostrarDropdown = signal(false);

  private buscarSubject = new Subject<string>();
  private buscarSub?: Subscription;

  // IDs ya invitados para excluirlos de las sugerencias
  idsExcluidos = computed(() => this.items().map(i => i.idInfluencer));

  ngOnInit(): void {
    this.buscarSub = this.buscarSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(nombre => {
        if (!nombre.trim()) {
          this.resultados.set([]);
          this.buscando.set(false);
          this.mostrarDropdown.set(false);
          return [];
        }
        this.buscando.set(true);
        this.error.set('');
        return this.influencerService.getInfluencers({ search: nombre, pageSize: 8 });
      })
    ).subscribe({
      next: (res: any) => {
        const filtrados = (res.items || [])
          .filter((i: Influencer) => !this.items().some(inv => inv.idInfluencer === i.idInfluencer))
          .map((i: Influencer) => ({ idInfluencer: i.idInfluencer, nombreSocial: i.nombreSocial }));
        this.resultados.set(filtrados);
        this.mostrarDropdown.set(true);
        this.buscando.set(false);
      },
      error: () => {
        this.error.set('Error al buscar influencers.');
        this.buscando.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.buscarSub?.unsubscribe();
  }

  onInput(valor: string): void {
    this.buscarNombre.set(valor);
    this.seleccionado.set(null);
    if (!valor.trim()) {
      this.resultados.set([]);
      this.mostrarDropdown.set(false);
      this.buscando.set(false);
      return;
    }
    this.buscando.set(true);
    this.buscarSubject.next(valor);
  }

  seleccionar(inf: { idInfluencer: number; nombreSocial: string }): void {
    this.seleccionado.set(inf);
    this.buscarNombre.set(inf.nombreSocial);
    this.resultados.set([]);
    this.mostrarDropdown.set(false);
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
    this.mostrarDropdown.set(false);
    this.mensaje.set('');
    this.error.set('');
  }

  agregarDesde(inf: Influencer): void {
    if (this.items().some(i => i.idInfluencer === inf.idInfluencer)) return;
    this.itemsChange.emit([
      ...this.items(),
      { idInfluencer: inf.idInfluencer, nombreSocial: inf.nombreSocial, mensaje: '' }
    ]);
  }

  eliminar(idx: number): void {
    this.itemsChange.emit(this.items().filter((_, i) => i !== idx));
  }
}
