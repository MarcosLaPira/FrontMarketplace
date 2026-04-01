import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { InfluencerDetalle } from '../../models/types';
import { InfluencerService } from '../../services/influencer.service';

@Component({
  selector: 'app-influencer-detail-panel',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  templateUrl: './influencer-detail-panel.component.html'
})
export class InfluencerDetailPanelComponent implements OnInit {
  private influencerService = inject(InfluencerService);

  idInfluencer = input.required<number>();
  closed = output<void>();

  influencer = signal<InfluencerDetalle | null>(null);
  loading = signal(true);
  error = signal('');
  activeTab = signal<'general' | 'estadisticas' | 'historial'>('general');

  ngOnInit(): void {
    this.loadInfluencer();
  }

  loadInfluencer(): void {
    this.loading.set(true);
    this.error.set('');
    this.influencerService.getInfluencerById(this.idInfluencer()).subscribe({
      next: (data: InfluencerDetalle) => {
        this.influencer.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información del influencer.');
        this.loading.set(false);
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  get initials(): string {
    const name = this.influencer()?.nombreSocial || '';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  formatFollowers(count: number): string {
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + 'M';
    if (count >= 1_000) return (count / 1_000).toFixed(1) + 'K';
    return count.toString();
  }

  get totalCampanas(): number {
    const h = this.influencer()?.historialCampanas;
    return h ? h.campanasInstagram + h.campanasTikTok + h.campanasOtras : 0;
  }

  get tasaAceptacion(): number {
    const h = this.influencer()?.historialCampanas;
    if (!h || h.totalPostulaciones === 0) return 0;
    return Math.round((h.postulacionesAceptadas / h.totalPostulaciones) * 100);
  }

  estadoColor(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'aceptada': return 'bg-green-100 text-green-700';
      case 'rechazada': return 'bg-red-100 text-red-700';
      case 'pendiente': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
