import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategorySelectorComponent } from '../../../../../components/category-selector/category-selector.component';
import { InfluencerCardComponent } from '../../../../../components/influencer-card/influencer-card.component';
import { InfluencerDetailModalComponent } from '../../../../../components/influencer-detail-modal/influencer-detail-modal.component';
import { Influencer, InfluencerResumen, Categoria, PaginatedResponse } from '../../../../../models/types';
import { InfluencerService } from '../../../../../services/influencer.service';

@Component({
  selector: 'app-marca-influencers',
  standalone: true,
  imports: [FormsModule, CategorySelectorComponent, InfluencerCardComponent, InfluencerDetailModalComponent],
  templateUrl: './marca-influencers.component.html'
})
export class MarcaInfluencersComponent {
  private influencerService = inject(InfluencerService);

  categorias = input.required<Categoria[]>();

  influencers = signal<Influencer[]>([]);
  searchName = signal('');
  filterCategorias = signal<number[]>([]);
  loading = signal(false);
  selectedInfluencer = signal<InfluencerResumen | null>(null);

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
    this.loadInfluencers();
  }

  onSearch(): void {
    this.loadInfluencers();
  }

  loadInfluencers(): void {
    this.loading.set(true);
    const filters: { idsCategorias?: number[]; nombreSocial?: string; pageSize?: number } = { pageSize: 20 };

    const cats = this.filterCategorias();
    if (cats.length) filters.idsCategorias = cats;

    const name = this.searchName();
    if (name.trim()) filters.nombreSocial = name.trim();

    this.influencerService.getInfluencers(filters).subscribe({
      next: (data: PaginatedResponse<Influencer>) => {
        this.influencers.set(data.data || []);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading influencers:', err);
        this.loading.set(false);
      }
    });
  }
}
