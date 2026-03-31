import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Postulacion, InfluencerResumen } from '../../models/types';

@Component({
  selector: 'app-postulacion-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './postulacion-list.component.html'
})
export class PostulacionListComponent {
  postulaciones = input.required<Postulacion[]>();
  showActions = input(true);
  compact = input(false);

  accepted = output<number>();
  rejected = output<number>();
  influencerClicked = output<InfluencerResumen>();

  rowBg(post: Postulacion): string {
    switch (post.idEstadoPostulacion) {
      case 3: return 'bg-green-50 border-green-200';
      case 4: return 'bg-red-50 border-red-200';
      default: return 'bg-white';
    }
  }

  badgeClass(post: Postulacion): string {
    const base = 'px-3 py-1 rounded text-sm font-semibold';
    switch (post.idEstadoPostulacion) {
      case 3: return `${base} bg-green-100 text-green-800`;
      case 4: return `${base} bg-red-100 text-red-800`;
      default: return `${base} bg-gray-100 text-gray-600`;
    }
  }
}
