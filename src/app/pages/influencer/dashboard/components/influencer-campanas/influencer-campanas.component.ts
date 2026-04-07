import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Campana, CampanaFilter } from '../../../../../models/types';
import { CampanaService } from '../../../../../services/campana.service';
import { CatalogService } from '../../../../../services/catalog.service';
import { PostulacionService } from '../../../../../services/postulacion.service';
import { CampanaDetailComponent } from '../../../../../components/campana-detail/campana-detail.component';
import { InfluencerCampanaCardComponent } from '../influencer-campana-card/influencer-campana-card.component';

@Component({
  selector: 'app-influencer-campanas',
  standalone: true,
  imports: [FormsModule, CampanaDetailComponent, InfluencerCampanaCardComponent],
  templateUrl: './influencer-campanas.component.html'
})
export class InfluencerCampanasComponent implements OnInit {
  private campanaService = inject(CampanaService);
  private catalogService = inject(CatalogService);
  private postulacionService = inject(PostulacionService);

  campanas = signal<Campana[]>([]);
  loading = signal(false);
  showFilters = signal(false);
  viewMode = signal<'grid' | 'list'>('grid');
  expandedCampanaId = signal<number | null>(null);

  // Vista detalle
  selectedCampanaId = signal<number | null>(null);

  // Modal postulación
  postulacionModal = signal(false);
  postulacionCampana = signal<Campana | null>(null);
  postulacionMensaje = signal('');
  postulacionEnviando = signal(false);
  postulacionExito = signal(false);
  postulacionError = signal('');

  // Filtros
  filtroPlataforma = signal<number | undefined>(undefined);
  filtroCategorias = signal<number[]>([]);
  filtroPresencial = signal<boolean | undefined>(undefined);
  filtroProductoFisico = signal<boolean | undefined>(undefined);
  filtroEnvioIncluido = signal<boolean | undefined>(undefined);
  filtroCiudad = signal('');
  filtroProvincia = signal('');
  searchText = signal('');

  // Catálogos
  plataformas = this.catalogService.plataformas;
  categorias = this.catalogService.categorias;

  // Filtros activos count
  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filtroPlataforma()) count++;
    if (this.filtroCategorias().length) count++;
    if (this.filtroPresencial() !== undefined) count++;
    if (this.filtroProductoFisico() !== undefined) count++;
    if (this.filtroEnvioIncluido() !== undefined) count++;
    if (this.filtroCiudad()) count++;
    if (this.filtroProvincia()) count++;
    return count;
  });

  // Filtro local por texto (titulo/descripcion)
  filteredCampanas = computed(() => {
    const text = this.searchText().toLowerCase().trim();
    if (!text) return this.campanas();
    return this.campanas().filter(c =>
      c.titulo.toLowerCase().includes(text) ||
      c.descripcion.toLowerCase().includes(text) ||
      c.marca?.toLowerCase().includes(text)
    );
  });

  ngOnInit(): void {
    this.loadCampanas();
  }

  loadCampanas(): void {
    this.loading.set(true);
    const filters: CampanaFilter = {};
    if (this.filtroPlataforma()) filters.idPlataforma = this.filtroPlataforma();
    if (this.filtroCategorias().length) filters.idsCategorias = this.filtroCategorias();
    if (this.filtroPresencial() !== undefined) filters.esPresencial = this.filtroPresencial();
    if (this.filtroProductoFisico() !== undefined) filters.requiereProductoFisico = this.filtroProductoFisico();
    if (this.filtroEnvioIncluido() !== undefined) filters.envioProductoIncluido = this.filtroEnvioIncluido();
    if (this.filtroCiudad()) filters.ciudad = this.filtroCiudad();
    if (this.filtroProvincia()) filters.provincia = this.filtroProvincia();

    this.campanaService.getCampanas(filters).subscribe({
      next: (data) => { this.campanas.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  applyFilters(): void {
    this.loadCampanas();
  }

  toggleCategoria(id: number): void {
    const current = this.filtroCategorias();
    if (current.includes(id)) {
      this.filtroCategorias.set(current.filter(c => c !== id));
    } else {
      this.filtroCategorias.set([...current, id]);
    }
  }

  clearFilters(): void {
    this.filtroPlataforma.set(undefined);
    this.filtroCategorias.set([]);
    this.filtroPresencial.set(undefined);
    this.filtroProductoFisico.set(undefined);
    this.filtroEnvioIncluido.set(undefined);
    this.filtroCiudad.set('');
    this.filtroProvincia.set('');
    this.searchText.set('');
    this.loadCampanas();
  }

  toggleExpand(id: number): void {
    this.expandedCampanaId.set(this.expandedCampanaId() === id ? null : id);
  }

  verDetalle(id: number): void {
    this.selectedCampanaId.set(id);
  }

  volverAListado(): void {
    this.selectedCampanaId.set(null);
  }

  abrirPostulacion(campana: Campana): void {
    this.postulacionCampana.set(campana);
    this.postulacionMensaje.set('');
    this.postulacionExito.set(false);
    this.postulacionError.set('');
    this.postulacionModal.set(true);
  }

  cerrarPostulacion(): void {
    this.postulacionModal.set(false);
    this.postulacionCampana.set(null);
  }

  enviarPostulacion(): void {
    const campana = this.postulacionCampana();
    const mensaje = this.postulacionMensaje().trim();
    if (!campana || !mensaje) return;

    this.postulacionEnviando.set(true);
    this.postulacionError.set('');

    this.postulacionService.postular({ idCampana: campana.idCampana, mensaje }).subscribe({
      next: () => {
        this.postulacionEnviando.set(false);
        this.postulacionExito.set(true);
      },
      error: () => {
        this.postulacionEnviando.set(false);
        this.postulacionError.set('No se pudo enviar la postulación. Intentá de nuevo.');
      }
    });
  }
}
