import { Component, signal, inject } from '@angular/core';
import { InfluencerService } from '../../services/influencer.service';

@Component({
  selector: 'app-influencer-social-connect',
  standalone: true,
  templateUrl: './influencer-social-connect.component.html',
})
export class InfluencerSocialConnectComponent {
  influencerService = inject(InfluencerService);
  connecting = signal<string | null>(null);
  error = signal<string | null>(null);
  success = signal<boolean>(false);

  connect(provider: 'instagram' | 'tiktok') {
    this.connecting.set(provider);
    this.error.set(null);
    this.influencerService.startOAuth(provider).subscribe({
      next: (url) => {
        window.location.href = url;
      },
      error: (err) => {
        this.error.set('Error iniciando conexión: ' + err?.message || err);
        this.connecting.set(null);
      }
    });
  }
}
