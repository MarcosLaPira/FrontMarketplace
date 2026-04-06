import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CampanaService } from '../../services/campana.service';
import { InfluencerService } from '../../services/influencer.service';
import { AuthService } from '../../services/auth.service';
import { Campana, Influencer } from '../../models/types';
import { CatalogService } from '../../services/catalog.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { InfluencerCardComponent } from '../../components/influencer-card/influencer-card.component';
import { InvitarInfluencerModalComponent } from '../../components/invitar-influencer-modal/invitar-influencer-modal.component';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [FormsModule, NavbarComponent, InfluencerCardComponent, InvitarInfluencerModalComponent],
  templateUrl: './explore.component.html'
})
export class ExploreComponent implements OnInit {
  private campanaService = inject(CampanaService);
  private influencerService = inject(InfluencerService);
  private catalogService = inject(CatalogService);
  private authService = inject(AuthService);

  campanas = signal<Campana[]>([]);
  influencers = signal<Influencer[]>([]);
  loading = signal(false);
  activeTab = signal<'campanas' | 'influencers'>('campanas');

  filtroCategoria = '';
  filtroPlataforma = '';

  categories = this.catalogService.categorias;
  plataformas = this.catalogService.plataformas;

  // Invitación
  esMarca = computed(() => this.authService.userRole() === 'Marca');
  misCampanas = signal<Campana[]>([]);
  influencerParaInvitar = signal<Influencer | null>(null);
  invitacionExito = signal<string>('');
  invitacionError = signal<string>('');

  ngOnInit(): void {
    this.loadCampanas();
    this.loadInfluencers();
    if (this.esMarca()) {
      this.campanaService.getMisCampanas().subscribe({
        next: (data) => this.misCampanas.set(data),
        error: () => {}
      });
    }
  }

  loadCampanas(): void {
    this.loading.set(true);
    const filters: { idPlataforma?: number } = {};
    if (this.filtroPlataforma) filters.idPlataforma = parseInt(this.filtroPlataforma);

    this.campanaService.getCampanas(filters).subscribe({
      next: (data: Campana[]) => { this.campanas.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadInfluencers(): void {
    const filters: { idsCategorias?: number[] } = {};
    if (this.filtroCategoria) filters.idsCategorias = [parseInt(this.filtroCategoria)];

    this.influencerService.getInfluencers(filters).subscribe({
      next: (res) => { this.influencers.set(res.items || []); },
      error: () => {}
    });
  }

  onFilterChange(): void {
    if (this.activeTab() === 'campanas') this.loadCampanas();
    else this.loadInfluencers();
  }

  abrirInvitar(influencer: Influencer): void {
    this.invitacionExito.set('');
    this.invitacionError.set('');
    this.influencerParaInvitar.set(influencer);
  }

  cerrarModal(): void {
    this.influencerParaInvitar.set(null);
  }

  confirmarInvitacion(data: { idCampana: number; mensaje: string }): void {
    const influencer = this.influencerParaInvitar();
    if (!influencer) return;

    this.campanaService.invitarInfluencer(data.idCampana, influencer.idInfluencer, data.mensaje).subscribe({
      next: () => {
        this.influencerParaInvitar.set(null);
        this.invitacionExito.set(`Invitación enviada a ${influencer.nombreSocial}`);
        setTimeout(() => this.invitacionExito.set(''), 4000);
      },
      error: () => {
        this.invitacionError.set('No se pudo enviar la invitación. Intentá de nuevo.');
        setTimeout(() => this.invitacionError.set(''), 4000);
      }
    });
  }
}
