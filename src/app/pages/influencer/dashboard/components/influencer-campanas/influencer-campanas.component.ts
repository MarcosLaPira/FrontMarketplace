import { Component, input, output } from '@angular/core';
import { Campana } from '../../../../../models/types';

@Component({
  selector: 'app-influencer-campanas',
  standalone: true,
  templateUrl: './influencer-campanas.component.html'
})
export class InfluencerCampanasComponent {
  campanas = input.required<Campana[]>();

  postular = output<number>();
}
