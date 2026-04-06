import { Component, input, output, signal, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Campana } from '../../models/types';
import { CampanaService } from '../../services/campana.service';

@Component({
  selector: 'app-campana-detail',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './campana-detail.component.html'
})
export class CampanaDetailComponent implements OnInit {
  private campanaService = inject(CampanaService);

  idCampana = input.required<number>();
  hidePostular = input(false);
  volver = output<void>();
  postularme = output<Campana>();

  campana = signal<Campana | null>(null);
  loading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    this.campanaService.getCampanaById(this.idCampana()).subscribe({
      next: (data) => { this.campana.set(data); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
  }

  getImagenUrl(url: string): string {
    return url.startsWith('http') ? url : `https://localhost:7070${url}`;
  }

  getDaysLeft(): number {
    const c = this.campana();
    if (!c) return 0;
    const end = new Date(c.fechaFin);
    const now = new Date();
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  getDaysTotal(): number {
    const c = this.campana();
    if (!c) return 1;
    const start = new Date(c.fechaInicio);
    const end = new Date(c.fechaFin);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }

  getTimeProgress(): number {
    const c = this.campana();
    if (!c) return 0;
    const start = new Date(c.fechaInicio).getTime();
    const end = new Date(c.fechaFin).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  }

  getSpotsDisponibles(): number {
    const c = this.campana();
    if (!c) return 0;
    return Math.max(0, (c.cantidadInfluencers ?? 0) - (c.cantidadInfluencersAceptados ?? 0));
  }

  getSpotsPercent(): number {
    const c = this.campana();
    if (!c || !c.cantidadInfluencers) return 0;
    return Math.round(((c.cantidadInfluencersAceptados ?? 0) / c.cantidadInfluencers) * 100);
  }

  getPostulacionesCount(): number {
    return this.campana()?.postulaciones?.length ?? 0;
  }

  isCampanaActiva(): boolean {
    const c = this.campana();
    if (!c) return false;
    return c.estadoCampana?.idEstadoCampana === 1;
  }

  haySpotsDisponibles(): boolean {
    const c = this.campana();
    if (!c || !c.cantidadInfluencers) return true;
    return (c.cantidadInfluencersAceptados ?? 0) < c.cantidadInfluencers;
  }
}
