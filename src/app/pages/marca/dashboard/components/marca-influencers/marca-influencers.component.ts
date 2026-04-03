import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategorySelectorComponent } from '../../../../../components/category-selector/category-selector.component';
import { InfluencerCardComponent } from '../../../../../components/influencer-card/influencer-card.component';
import { InfluencerDetailPanelComponent } from '../../../../../components/influencer-detail-panel/influencer-detail-panel.component';
import { InvitarInfluencerModalComponent } from '../../../../../components/invitar-influencer-modal/invitar-influencer-modal.component';
import { Influencer, Categoria, Plataforma, InfluencerFilter, Campana } from '../../../../../models/types';
import { InfluencerService } from '../../../../../services/influencer.service';
import { CampanaService } from '../../../../../services/campana.service';

@Component({
  selector: 'app-marca-influencers',
  standalone: true,
  imports: [FormsModule, CategorySelectorComponent, InfluencerCardComponent, InfluencerDetailPanelComponent, InvitarInfluencerModalComponent],
  templateUrl: './marca-influencers.component.html'
})
export class MarcaInfluencersComponent {
  private influencerService = inject(InfluencerService);
  private campanaService = inject(CampanaService);

  categorias = input.required<Categoria[]>();
  plataformas = input.required<Plataforma[]>();
  misCampanas = input<Campana[]>([]);

  influencers = signal<Influencer[]>([]);
  loading = signal(false);
  selectedInfluencerId = signal<number | null>(null);
  showFilters = signal(false);

  // Invitación
  influencerParaInvitar = signal<Influencer | null>(null);
  invitacionExito = signal<string>('');
  invitacionError = signal<string>('');

  // Filtros
  searchName = signal('');
  filterCategorias = signal<number[]>([]);
  filterPlataformaId = signal<number | null>(null);
  filterSeguidoresMin = signal<number | null>(null);
  filterSeguidoresMax = signal<number | null>(null);
  filterCostoMin = signal<number | null>(null);
  filterCostoMax = signal<number | null>(null);
  filterSoloCanje = signal(false);
  filterSoloVerificados = signal(false);
  filterGeneroAudiencia = signal('');
  filterRatingMin = signal<number | null>(null);

  generosAudiencia = ['Masculino', 'Femenino', 'Mixto'];

  constructor() {
    this.loadInfluencers();
  }

  toggleFilterCategoria(id: number): void {
    const current = this.filterCategorias();
    if (current.includes(id)) {
      this.filterCategorias.set(current.filter(c => c !== id));
    } else {
      this.filterCategorias.set([...current, id]);
    }
  }

  onSearch(): void {
    this.loadInfluencers();
  }

  clearFilters(): void {
    this.searchName.set('');
    this.filterCategorias.set([]);
    this.filterPlataformaId.set(null);
    this.filterSeguidoresMin.set(null);
    this.filterSeguidoresMax.set(null);
    this.filterCostoMin.set(null);
    this.filterCostoMax.set(null);
    this.filterSoloCanje.set(false);
    this.filterSoloVerificados.set(false);
    this.filterGeneroAudiencia.set('');
    this.filterRatingMin.set(null);
    this.loadInfluencers();
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.filterCategorias().length) count++;
    if (this.filterPlataformaId()) count++;
    if (this.filterSeguidoresMin() != null) count++;
    if (this.filterSeguidoresMax() != null) count++;
    if (this.filterCostoMin() != null) count++;
    if (this.filterCostoMax() != null) count++;
    if (this.filterSoloCanje()) count++;
    if (this.filterSoloVerificados()) count++;
    if (this.filterGeneroAudiencia()) count++;
    if (this.filterRatingMin() != null) count++;
    return count;
  }

  loadInfluencers(): void {
    this.loading.set(true);
    const filters: InfluencerFilter = { pageSize: 20 };

    const cats = this.filterCategorias();
    if (cats.length) filters.idsCategorias = cats;

    const name = this.searchName();
    if (name.trim()) filters.search = name.trim();

    if (this.filterPlataformaId()) filters.plataformaId = this.filterPlataformaId()!;
    if (this.filterSeguidoresMin() != null) filters.seguidoresMin = this.filterSeguidoresMin()!;
    if (this.filterSeguidoresMax() != null) filters.seguidoresMax = this.filterSeguidoresMax()!;
    if (this.filterCostoMin() != null) filters.costoMin = this.filterCostoMin()!;
    if (this.filterCostoMax() != null) filters.costoMax = this.filterCostoMax()!;
    if (this.filterSoloCanje()) filters.soloCanje = true;
    if (this.filterSoloVerificados()) filters.soloVerificados = true;
    if (this.filterGeneroAudiencia()) filters.generoAudiencia = this.filterGeneroAudiencia();
    if (this.filterRatingMin() != null) filters.ratingMin = this.filterRatingMin()!;

    this.influencerService.getInfluencers(filters).subscribe({
      next: (data: Influencer[]) => {
        this.influencers.set(data || []);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading influencers:', err);
        this.loading.set(false);
      }
    });
  }

  openDetail(id: number): void {
    this.selectedInfluencerId.set(id);
  }

  closeDetail(): void {
    this.selectedInfluencerId.set(null);
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
