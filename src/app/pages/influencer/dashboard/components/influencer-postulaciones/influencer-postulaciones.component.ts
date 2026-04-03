import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Postulacion, InvitacionInfluencer } from '../../../../../models/types';
import { PostulacionService } from '../../../../../services/postulacion.service';
import { InvitacionService } from '../../../../../services/invitacion.service';

@Component({
  selector: 'app-influencer-postulaciones',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './influencer-postulaciones.component.html'
})
export class InfluencerPostulacionesComponent implements OnInit {
  private postulacionService = inject(PostulacionService);
  private invitacionService = inject(InvitacionService);

  activeSubTab = signal<'postulaciones' | 'invitaciones'>('postulaciones');

  postulaciones = signal<Postulacion[]>([]);
  loadingPostulaciones = signal(false);

  invitaciones = signal<InvitacionInfluencer[]>([]);
  loadingInvitaciones = signal(false);

  totalPostulaciones = computed(() => this.postulaciones().length);
  totalInvitaciones = computed(() => this.invitaciones().length);

  ngOnInit(): void {
    this.loadPostulaciones();
    this.loadInvitaciones();
  }

  loadPostulaciones(): void {
    this.loadingPostulaciones.set(true);
    this.postulacionService.getMisPostulaciones().subscribe({
      next: (data) => {
        this.postulaciones.set(data);
        this.loadingPostulaciones.set(false);
      },
      error: () => this.loadingPostulaciones.set(false)
    });
  }

  loadInvitaciones(): void {
    this.loadingInvitaciones.set(true);
    this.invitacionService.getMisInvitaciones().subscribe({
      next: (data) => {
        this.invitaciones.set(data);
        this.loadingInvitaciones.set(false);
      },
      error: () => this.loadingInvitaciones.set(false)
    });
  }

  getEstadoClass(estado: string): string {
    const s = estado?.toLowerCase();
    if (s === 'aceptada' || s === 'aprobada') return 'bg-green-50 text-green-600 border-green-100';
    if (s === 'rechazada') return 'bg-red-50 text-red-600 border-red-100';
    if (s === 'pendiente') return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-gray-50 text-gray-600 border-gray-100';
  }

  getDaysLeft(fecha: string): number {
    const end = new Date(fecha);
    const now = new Date();
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }
}
