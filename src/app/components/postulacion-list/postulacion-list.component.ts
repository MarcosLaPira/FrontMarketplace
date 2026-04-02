import { Component, input, output } from '@angular/core';
import { Postulacion } from '../../models/types';
import { PostulacionItemComponent } from '../postulacion-item/postulacion-item.component';

@Component({
  selector: 'app-postulacion-list',
  standalone: true,
  imports: [PostulacionItemComponent],
  templateUrl: './postulacion-list.component.html'
})
export class PostulacionListComponent {
  postulaciones = input.required<Postulacion[]>();
  showActions = input(true);
  compact = input(false);

  accepted = output<number>();
  rejected = output<number>();
}
