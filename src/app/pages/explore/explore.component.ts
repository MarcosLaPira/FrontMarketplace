import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CampanaService } from '../../services/campana.service';
import { InfluencerService } from '../../services/influencer.service';
import { Campana, Influencer } from '../../models/types';
import { CatalogService } from '../../services/catalog.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { InfluencerCardComponent } from '../../components/influencer-card/influencer-card.component';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [FormsModule, NavbarComponent, InfluencerCardComponent],
  templateUrl: './explore.component.html'
})
export class ExploreComponent implements OnInit {
  private campanaService = inject(CampanaService);
  private influencerService = inject(InfluencerService);
  private catalogService = inject(CatalogService);

  campanas = signal<Campana[]>([]);
  influencers = signal<Influencer[]>([]);
  loading = signal(false);
  activeTab = signal<'campanas' | 'influencers'>('campanas');

  filtroCategoria = '';
  filtroPlataforma = '';

  categories = this.catalogService.categorias;
  plataformas = this.catalogService.plataformas;

  ngOnInit(): void {
    this.loadCampanas();
    this.loadInfluencers();
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
      next: (data: Influencer[]) => { this.influencers.set(data || []); },
      error: () => {}
    });
  }

  onFilterChange(): void {
    if (this.activeTab() === 'campanas') this.loadCampanas();
    else this.loadInfluencers();
  }
}
