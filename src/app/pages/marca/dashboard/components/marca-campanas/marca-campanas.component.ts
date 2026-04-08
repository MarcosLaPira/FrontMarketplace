import { Component, inject, input, output, signal, computed } from '@angular/core';
import { CampanaFormComponent } from '../../../../../components/campana-form/campana-form.component';
import { CampanaCardComponent } from '../../../../../components/campana-card/campana-card.component';
import { PostulacionListComponent } from '../../../../../components/postulacion-list/postulacion-list.component';
import { Campana, Categoria, Plataforma, TipoContenido, CampanaCreateRequest } from '../../../../../models/types';
import { CampanaService } from '../../../../../services/campana.service';
import { PostulacionService } from '../../../../../services/postulacion.service';

@Component({
  selector: 'app-marca-campanas',
  standalone: true,
  imports: [CampanaFormComponent, CampanaCardComponent, PostulacionListComponent],
  templateUrl: './marca-campanas.component.html'
})
export class MarcaCampanasComponent {
  private campanaService = inject(CampanaService);
  private postulacionService = inject(PostulacionService);

  invitarInfluencerClick = output<number>();

  categorias = input.required<Categoria[]>();
  plataformas = input.required<Plataforma[]>();
  tiposContenido = input.required<TipoContenido[]>();
  campanas = input.required<Campana[]>();

  showNewForm = signal(false);
  editingCampana = signal<Campana | null>(null);
  subTab = signal<'publicadas' | 'enCurso' | 'pasadas'>('publicadas');
  expandedCampanaId = signal<number | null>(null);

  private estadosInactivos = [6, 7]; // 6 = Finalizada, 7 = Cancelada
  private estadosEnCurso = [2, 3, 4, 5];

  private esInactiva(c: Campana): boolean {
    return c.estadoCampana != null && this.estadosInactivos.includes(c.estadoCampana.idEstadoCampana);
  }

  campanasPublicadas = computed(() =>
    this.campanas().filter(c => c.estadoCampana?.idEstadoCampana === 1)
  );

  campanasEnCurso = computed(() =>
    this.campanas().filter(c =>
      c.estadoCampana != null && this.estadosEnCurso.includes(c.estadoCampana.idEstadoCampana)
    )
  );

  campanasPasadas = computed(() => {
    const now = new Date();
    return this.campanas().filter(c =>
      new Date(c.fechaFin) < now || this.esInactiva(c)
    );
  });

  crearCampana(data: { form: any; categorias: number[]; imagenesProducto: File[]; plataformaContenidos: any[]; entregables: any[]; invitaciones: any[] }): void {
    const request = this.buildRequest(data);
    this.campanaService.createCampana(request, data.imagenesProducto).subscribe({
      next: () => {
        this.showNewForm.set(false);
        this.reloadCampanas();
      },
      error: (err: any) => console.error('Error creating campaign:', err)
    });
  }

  startEdit(campana: Campana): void {
    this.editingCampana.set(campana);
  }

  guardarEdit(data: { form: any; categorias: number[]; imagenesProducto: File[]; plataformaContenidos: any[]; entregables: any[]; invitaciones: any[] }): void {
    const campana = this.editingCampana();
    if (!campana) return;

    const request = this.buildRequest(data);
    this.campanaService.updateCampana(campana.idCampana, request, data.imagenesProducto).subscribe({
      next: () => {
        this.editingCampana.set(null);
        this.reloadCampanas();
      },
      error: (err: any) => console.error('Error updating campaign:', err)
    });
  }

  cancelEdit(): void {
    this.editingCampana.set(null);
  }

  invitarInfluencer(idCampana: number): void {
    this.invitarInfluencerClick.emit(idCampana);
  }

  deleteCampana(idCampana: number): void {
    if (confirm('¿Estás seguro de cancelar esta campaña?')) {
      this.campanaService.cambiarEstado(idCampana, 7).subscribe({
        next: () => this.reloadCampanas(),
        error: (err: any) => console.error('Error changing campaign state:', err)
      });
    }
  }

  togglePostulaciones(idCampana: number): void {
    this.expandedCampanaId.set(
      this.expandedCampanaId() === idCampana ? null : idCampana
    );
  }

  aceptarPostulacion(idPostulacion: number): void {
    this.postulacionService.cambiarEstado(idPostulacion, 3).subscribe({
      next: () => this.reloadCampanas(),
      error: (err: any) => console.error('Error accepting postulacion:', err)
    });
  }

  rechazarPostulacion(idPostulacion: number): void {
    this.postulacionService.cambiarEstado(idPostulacion, 4).subscribe({
      next: () => this.reloadCampanas(),
      error: (err: any) => console.error('Error rejecting postulacion:', err)
    });
  }

  private buildRequest(data: { form: any; categorias: number[]; imagenesProducto: File[]; plataformaContenidos: any[]; entregables: any[]; invitaciones: any[] }): CampanaCreateRequest {
    const val = data.form;
    return {
      titulo: val.titulo,
      descripcion: val.descripcion,
      idPlataforma: Number(val.idPlataforma),
      idsCategorias: data.categorias,
      presupuesto: Number(val.presupuesto),
      fechaInicio: new Date(val.fechaInicio),
      fechaFin: new Date(val.fechaFin),
      esPresencial: val.esPresencial,
      direccion: val.direccion || undefined,
      ciudad: val.ciudad || undefined,
      provincia: val.provincia || undefined,
      requiereProductoFisico: val.requiereProductoFisico,
      requiereProductoVirtual: val.requiereProductoVirtual,
      envioProductoIncluido: val.envioProductoIncluido,
      notasLogisticas: val.notasLogisticas || undefined,
      campanaPublica: val.campanaPublica,
      cantidadInfluencers: Number(val.cantidadInfluencers),
      minimoSeguidores: val.minimoSeguidores ? Number(val.minimoSeguidores) : undefined,
      esExcluyenteMinimoSeguidores: val.esExcluyenteMinimoSeguidores ?? false,
      plataformaContenidos: data.plataformaContenidos.length > 0 ? data.plataformaContenidos : undefined,
      entregables: data.entregables.length > 0 ? data.entregables : undefined,
      invitaciones: data.invitaciones.length > 0 ? data.invitaciones : undefined
    };
  }

  private reloadCampanas(): void {
    this.campanaService.getMisCampanas().subscribe({
      next: (data: Campana[]) => {
        // Emitimos recarga via el mismo input pattern - el padre recarga
      }
    });
    // Forzamos recarga en el padre
    window.dispatchEvent(new CustomEvent('reload-campanas'));
  }
}
