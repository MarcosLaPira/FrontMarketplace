import { Component, input, output, signal, computed } from '@angular/core';
import { CampanaFormComponent } from '../../../../../components/campana-form/campana-form.component';
import { CampanaDetailComponent } from '../../../../../components/campana-detail/campana-detail.component';
import { PostulacionListComponent } from '../../../../../components/postulacion-list/postulacion-list.component';
import { MarcaEntregaChatComponent } from '../marca-entrega-chat/marca-entrega-chat.component';
import { Campana, Categoria, Plataforma, TipoContenido } from '../../../../../models/types';

@Component({
  selector: 'app-campana-detalle-gestion',
  standalone: true,
  imports: [CampanaFormComponent, CampanaDetailComponent, PostulacionListComponent, MarcaEntregaChatComponent],
  templateUrl: './campana-detalle-gestion.component.html'
})
export class CampanaDetalleGestionComponent {
  campana = input.required<Campana>();
  categorias = input.required<Categoria[]>();
  plataformas = input.required<Plataforma[]>();
  tiposContenido = input.required<TipoContenido[]>();
  isEditing = input(false);
  isPast = input(false);

  volver = output<void>();
  editClicked = output<void>();
  editSaved = output<{ form: any; categorias: number[]; imagenesProducto: File[]; plataformaContenidos: any[]; entregables: any[]; invitaciones: any[] }>();
  editCancelled = output<void>();
  invitar = output<number>();
  cancelar = output<number>();
  postulacionAceptada = output<number>();
  postulacionRechazada = output<number>();

  detailTab = signal<'postulantes' | 'invitaciones'>('postulantes');

  postulacionesPendientes = computed(() =>
    this.campana().postulaciones?.filter(p => p.idEstadoPostulacion === 1).length ?? 0
  );

  readonly estadosConEntregas = [3, 4, 5];

  tieneEntregas = computed(() =>
    this.estadosConEntregas.includes(this.campana().estadoCampana?.idEstadoCampana ?? 0)
  );
}
