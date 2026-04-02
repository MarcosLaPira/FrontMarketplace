import { Component, input, output, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Postulacion, InfluencerResumen } from '../../models/types';
import { InfluencerDetailPanelComponent } from '../influencer-detail-panel/influencer-detail-panel.component';

@Component({
  selector: 'app-postulacion-item',
  standalone: true,
  imports: [DatePipe, DecimalPipe, InfluencerDetailPanelComponent],
  templateUrl: './postulacion-item.component.html'
})
export class PostulacionItemComponent {
  postulacion = input.required<Postulacion>();
  compact = input(false);
  showActions = input(true);

  accepted = output<number>();
  rejected = output<number>();

  showDetail = signal(false);

  openDetail(): void {
    this.showDetail.set(true);
  }

  closeDetail(): void {
    this.showDetail.set(false);
  }

  getFotoUrl(fotoPerfil?: string): string | null {
    if (!fotoPerfil) return null;
    return fotoPerfil.startsWith('http') ? fotoPerfil : `https://localhost:7070${fotoPerfil}`;
  }

  rowBg(): string {
    switch (this.postulacion().idEstadoPostulacion) {
      case 3: return 'bg-green-50/50 border-green-200';
      case 4: return 'bg-red-50/50 border-red-200';
      default: return 'bg-white border-gray-100 hover:shadow-md hover:-translate-y-0.5';
    }
  }

  badgeClass(): string {
    switch (this.postulacion().idEstadoPostulacion) {
      case 3: return 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200';
      case 4: return 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200';
      default: return 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200';
    }
  }
}
