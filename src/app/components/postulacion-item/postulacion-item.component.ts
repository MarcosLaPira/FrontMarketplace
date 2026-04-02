import { Component, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Postulacion, InfluencerResumen } from '../../models/types';
import { InfluencerDetailPanelComponent } from '../influencer-detail-panel/influencer-detail-panel.component';

@Component({
  selector: 'app-postulacion-item',
  standalone: true,
  imports: [DatePipe, InfluencerDetailPanelComponent],
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
      case 3: return 'bg-green-50 border-green-200';
      case 4: return 'bg-red-50 border-red-200';
      default: return 'bg-white';
    }
  }

  badgeClass(): string {
    const base = 'px-3 py-1 rounded text-sm font-semibold';
    switch (this.postulacion().idEstadoPostulacion) {
      case 3: return `${base} bg-green-100 text-green-800`;
      case 4: return `${base} bg-red-100 text-red-800`;
      default: return `${base} bg-gray-100 text-gray-600`;
    }
  }
}
