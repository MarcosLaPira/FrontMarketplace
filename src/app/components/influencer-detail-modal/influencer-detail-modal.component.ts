import { Component, input, output } from '@angular/core';
import { InfluencerResumen } from '../../models/types';

@Component({
  selector: 'app-influencer-detail-modal',
  standalone: true,
  templateUrl: './influencer-detail-modal.component.html'
})
export class InfluencerDetailModalComponent {
  influencer = input.required<InfluencerResumen>();

  closed = output<void>();
}
