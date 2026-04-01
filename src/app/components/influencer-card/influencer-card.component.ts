import { Component, input } from '@angular/core';
import { Influencer } from '../../models/types';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-influencer-card',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './influencer-card.component.html'
})
export class InfluencerCardComponent {
  influencer = input.required<Influencer>();

  get initials(): string {
    return this.influencer().nombreSocial
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  formatFollowers(count: number): string {
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + 'M';
    if (count >= 1_000) return (count / 1_000).toFixed(1) + 'K';
    return count.toString();
  }
}
