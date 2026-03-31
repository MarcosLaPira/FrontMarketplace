import { Component, input } from '@angular/core';
import { Influencer } from '../../models/types';

@Component({
  selector: 'app-influencer-card',
  standalone: true,
  templateUrl: './influencer-card.component.html'
})
export class InfluencerCardComponent {
  influencer = input.required<Influencer>();
}
