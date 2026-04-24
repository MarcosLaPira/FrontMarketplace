import { Component, inject, input, output, signal, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { CategorySelectorComponent } from '../category-selector/category-selector.component';
import {
  Categoria,
  Plataforma,
  TipoContenido,
  Campana,
  Influencer,
  PlataformaContenidoInput,
  EntregableInput,
  InvitacionInput,
  CampanaPlataformaContenido,
  CampanaEntregable,
  InvitacionCampana
} from '../../models/types';
import { InfluencerService } from '../../services/influencer.service';

interface InvitacionDisplay {
  idInfluencer: number;
  nombreSocial: string;
  mensaje: string;
}

@Component({
  selector: 'app-campana-form',
  standalone: true,
  imports: [ReactiveFormsModule, CategorySelectorComponent, DecimalPipe, DatePipe],
  templateUrl: './campana-form.component.html'
})
export class CampanaFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private influencerService = inject(InfluencerService);
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly maxImageSizeBytes = 5 * 1024 * 1024;

  categorias = input.required<Categoria[]>();
  plataformas = input.required<Plataforma[]>();
  tiposContenido = input.required<TipoContenido[]>();
  campana = input<Campana | null>(null);

  saved = output<{
    form: any;
    categorias: number[];
    imagenesProducto: File[];
    plataformaContenidos: PlataformaContenidoInput[];
    entregables: EntregableInput[];
    invitaciones: InvitacionInput[];
  }>();
  cancelled = output<void>();

  selectedCategorias = signal<number[]>([]);
  imagenesProducto = signal<File[]>([]);
  imagenesProductoPreview = signal<Array<{ name: string; url: string; size: string }>>([]);
  imagenesProductoErrors = signal<string[]>([]);

  // ── Plataforma + Tipo Contenido ──
  plataformaContenidos = signal<PlataformaContenidoInput[]>([]);
  nuevaPC = signal<{ idPlataforma: string; idTipoContenido: string; precio: string }>({
    idPlataforma: '', idTipoContenido: '', precio: ''
  });

  // ── Entregables ──
  entregables = signal<EntregableInput[]>([]);
  nuevoEntregable = signal<{ descripcion: string; fechaLimite: string }>({
    descripcion: '', fechaLimite: ''
  });

  // ── Invitaciones ──
  invitaciones = signal<InvitacionDisplay[]>([]);
  invBuscarNombre = signal<string>('');
  invResultados = signal<Array<{ idInfluencer: number; nombreSocial: string }>>([]);
  invInfluencerSeleccionado = signal<{ idInfluencer: number; nombreSocial: string } | null>(null);
  invMensaje = signal<string>('');
  invBuscando = signal<boolean>(false);
  invError = signal<string>('');

  form = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required],
    idPlataforma: [''],
    presupuesto: ['', Validators.required],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    esPresencial: [false],
    direccion: [''],
    ciudad: [''],
    provincia: [''],
    requiereProductoFisico: [false],
    requiereProductoVirtual: [false],
    envioProductoIncluido: [false],
    notasLogisticas: [''],
    campanaPublica: [true],
    cantidadInfluencers: ['', Validators.required],
    minimoSeguidores: [null as number | null],
    esExcluyenteMinimoSeguidores: [false]
  });

  get isEditMode(): boolean {
    return this.campana() !== null;
  }

  get esPresencial(): boolean {
    return this.form.get('esPresencial')?.value ?? false;
  }

  get esVirtual(): boolean {
    return !this.esPresencial;
  }

  get requiereProductoFisico(): boolean {
    return this.form.get('requiereProductoFisico')?.value ?? false;
  }

  get requiereProductoVirtual(): boolean {
    return this.form.get('requiereProductoVirtual')?.value ?? false;
  }

  get hasImagenesProductoErrors(): boolean {
    return this.imagenesProductoErrors().length > 0;
  }

  get minimoSeguidoresValue(): number | null {
    return this.form.get('minimoSeguidores')?.value ?? null;
  }

  get canAgregarPC(): boolean {
    const pc = this.nuevaPC();
    return !!pc.idPlataforma && !!pc.idTipoContenido && !!pc.precio && Number(pc.precio) > 0;
  }

  get canAgregarEntregable(): boolean {
    const e = this.nuevoEntregable();
    return !!e.descripcion.trim() && !!e.fechaLimite;
  }

  ngOnInit(): void {
    const c = this.campana();
    if (c) {
      this.form.patchValue({
        titulo: c.titulo,
        descripcion: c.descripcion,
        idPlataforma: String(c.plataforma?.idPlataforma ?? ''),
        presupuesto: String(c.presupuesto),
        fechaInicio: this.formatDateForInput(c.fechaInicio),
        fechaFin: this.formatDateForInput(c.fechaFin),
        esPresencial: c.esPresencial ?? false,
        direccion: c.direccion ?? '',
        ciudad: c.ciudad ?? '',
        provincia: c.provincia ?? '',
        requiereProductoFisico: c.requiereProductoFisico ?? false,
        requiereProductoVirtual: c.requiereProductoVirtual ?? false,
        envioProductoIncluido: c.envioProductoIncluido ?? false,
        notasLogisticas: c.notasLogisticas ?? '',
        campanaPublica: c.campanaPublica ?? false,
        cantidadInfluencers: String(c.cantidadInfluencers ?? ''),
        minimoSeguidores: c.minimoSeguidores ?? null,
        esExcluyenteMinimoSeguidores: c.esExcluyenteMinimoSeguidores ?? false
      });
      this.selectedCategorias.set(c.categorias?.map(cat => cat.idCategoria) || []);

      // Pre-cargar plataformaContenidos
      if (c.plataformaContenidos?.length) {
        this.plataformaContenidos.set(
          c.plataformaContenidos.map((pc: CampanaPlataformaContenido) => ({
            idPlataforma: pc.idPlataforma,
            idTipoContenido: pc.idTipoContenido,
            precio: pc.precio
          }))
        );
      }

      // Pre-cargar entregables
      if (c.entregables?.length) {
        this.entregables.set(
          c.entregables.map((e: CampanaEntregable) => ({
            descripcion: e.descripcion,
            fechaLimite: e.fechaLimite.substring(0, 10),
            orden: e.orden
          }))
        );
      }

      // Pre-cargar invitaciones
      if (c.invitacionesCampana?.length) {
        this.invitaciones.set(
          c.invitacionesCampana.map((inv: InvitacionCampana) => ({
            idInfluencer: inv.idInfluencer,
            nombreSocial: inv.nombreSocialInfluencer,
            mensaje: inv.mensaje ?? ''
          }))
        );
      }
    }

    this.updateNotasLogisticasState();

    this.form.get('esPresencial')?.valueChanges.subscribe((esPresencial) => {
      if (esPresencial) {
        this.form.patchValue(
          {
            requiereProductoFisico: false,
            requiereProductoVirtual: false,
            envioProductoIncluido: false
          },
          { emitEvent: false }
        );
      }

      this.updateNotasLogisticasState();
      this.updateImagenesProductoState();
    });

    this.form.get('requiereProductoFisico')?.valueChanges.subscribe((requiereFisico) => {
      if (requiereFisico) {
        this.form.patchValue({ requiereProductoVirtual: false }, { emitEvent: false });
      } else {
        this.form.patchValue({ envioProductoIncluido: false }, { emitEvent: false });
      }

      this.updateImagenesProductoState();
    });

    this.form.get('requiereProductoVirtual')?.valueChanges.subscribe((requiereVirtual) => {
      if (requiereVirtual) {
        this.form.patchValue(
          {
            requiereProductoFisico: false,
            envioProductoIncluido: false
          },
          { emitEvent: false }
        );
      }

      this.updateNotasLogisticasState();
      this.updateImagenesProductoState();
    });

    this.form.get('minimoSeguidores')?.valueChanges.subscribe((val) => {
      if (!val) {
        this.form.patchValue({ esExcluyenteMinimoSeguidores: false }, { emitEvent: false });
      }
    });
  }

  ngOnDestroy(): void {
    this.clearImagenesProductoPreview();
  }

  // ── Modalidad / producto ──

  setModalidad(esPresencial: boolean): void {
    this.form.patchValue({ esPresencial });
  }

  setTipoProducto(tipo: 'fisico' | 'virtual'): void {
    this.form.patchValue({
      requiereProductoFisico: tipo === 'fisico',
      requiereProductoVirtual: tipo === 'virtual',
      envioProductoIncluido: tipo === 'fisico' ? this.form.get('envioProductoIncluido')?.value ?? false : false
    });
  }

  // ── Imágenes de producto ──

  onProductoImagenesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    let currentFiles = this.imagenesProducto();
    const validFiles: File[] = [...currentFiles];
    const errors: string[] = [];

    for (const file of files) {
      if (validFiles.length >= 3) break;
      if (!this.allowedImageTypes.includes(file.type)) {
        errors.push(`Formato no soportado: ${file.name}. Usá JPG, PNG o WEBP.`);
        continue;
      }
      if (file.size > this.maxImageSizeBytes) {
        errors.push(`La imagen ${file.name} supera 5MB.`);
        continue;
      }
      if (validFiles.some(f => f.name === file.name && f.size === file.size)) {
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 3) {
      errors.push('Solo se permiten hasta 3 imágenes.');
      validFiles.splice(3);
    }

    this.imagenesProductoErrors.set(errors);
    this.imagenesProducto.set(validFiles);
    this.setImagenesProductoPreview(validFiles);

    if (input) {
      input.value = '';
    }
  }

  eliminarImagenProducto(idx: number): void {
    const files = this.imagenesProducto();
    const previews = this.imagenesProductoPreview();
    if (files[idx]) {
      URL.revokeObjectURL(previews[idx].url);
      const newFiles = files.slice(0, idx).concat(files.slice(idx + 1));
      this.imagenesProducto.set(newFiles);
      this.setImagenesProductoPreview(newFiles);
    }
  }

  // ── Categorías ──

  toggleCategoria(id: number): void {
    const current = this.selectedCategorias();
    if (current.includes(id)) {
      this.selectedCategorias.set(current.filter(c => c !== id));
    } else {
      this.selectedCategorias.set([...current, id]);
    }
  }

  // ── Plataforma + Tipo Contenido ──

  setNuevaPC(field: 'idPlataforma' | 'idTipoContenido' | 'precio', value: string): void {
    this.nuevaPC.update(pc => ({ ...pc, [field]: value }));
  }

  agregarPlataformaContenido(): void {
    if (!this.canAgregarPC) return;
    const pc = this.nuevaPC();
    const existing = this.plataformaContenidos();
    const isDuplicate = existing.some(
      e => e.idPlataforma === Number(pc.idPlataforma) && e.idTipoContenido === Number(pc.idTipoContenido)
    );
    if (isDuplicate) return;

    this.plataformaContenidos.update(list => [
      ...list,
      { idPlataforma: Number(pc.idPlataforma), idTipoContenido: Number(pc.idTipoContenido), precio: Number(pc.precio) }
    ]);
    this.nuevaPC.set({ idPlataforma: '', idTipoContenido: '', precio: '' });
  }

  eliminarPlataformaContenido(idx: number): void {
    this.plataformaContenidos.update(list => list.filter((_, i) => i !== idx));
  }

  getNombrePlataforma(id: number): string {
    return this.plataformas().find(p => p.idPlataforma === id)?.nombrePlataforma ?? '';
  }

  getNombreTipoContenido(id: number): string {
    return this.tiposContenido().find(t => t.idTipoContenido === id)?.nombre ?? '';
  }

  // ── Entregables ──

  setNuevoEntregable(field: 'descripcion' | 'fechaLimite', value: string): void {
    this.nuevoEntregable.update(e => ({ ...e, [field]: value }));
  }

  agregarEntregable(): void {
    if (!this.canAgregarEntregable) return;
    const e = this.nuevoEntregable();
    const orden = this.entregables().length + 1;
    this.entregables.update(list => [
      ...list,
      { descripcion: e.descripcion.trim(), fechaLimite: e.fechaLimite, orden }
    ]);
    this.nuevoEntregable.set({ descripcion: '', fechaLimite: '' });
  }

  eliminarEntregable(idx: number): void {
    this.entregables.update(list =>
      list.filter((_, i) => i !== idx).map((e, i) => ({ ...e, orden: i + 1 }))
    );
  }

  // ── Invitaciones ──

  buscarInfluencer(): void {
    const nombre = this.invBuscarNombre().trim();
    if (!nombre) return;

    this.invBuscando.set(true);
    this.invError.set('');
    this.invResultados.set([]);
    this.invInfluencerSeleccionado.set(null);

    this.influencerService.getInfluencers({ search: nombre }).subscribe({
      next: (res) => {
        const filtrados = (res.items || [])
          .filter((i: Influencer) => !this.invitaciones().some(inv => inv.idInfluencer === i.idInfluencer))
          .map((i: Influencer) => ({ idInfluencer: i.idInfluencer, nombreSocial: i.nombreSocial }));
        this.invResultados.set(filtrados);
        if (filtrados.length === 0) {
          this.invError.set('No se encontraron influencers con ese nombre.');
        }
        this.invBuscando.set(false);
      },
      error: () => {
        this.invError.set('Error al buscar influencers.');
        this.invBuscando.set(false);
      }
    });
  }

  seleccionarInfluencer(inf: { idInfluencer: number; nombreSocial: string }): void {
    this.invInfluencerSeleccionado.set(inf);
    this.invResultados.set([]);
    this.invError.set('');
  }

  agregarInvitacion(): void {
    const inf = this.invInfluencerSeleccionado();
    if (!inf) return;

    const alreadyAdded = this.invitaciones().some(i => i.idInfluencer === inf.idInfluencer);
    if (alreadyAdded) return;

    this.invitaciones.update(list => [
      ...list,
      { idInfluencer: inf.idInfluencer, nombreSocial: inf.nombreSocial, mensaje: this.invMensaje() }
    ]);

    this.invBuscarNombre.set('');
    this.invInfluencerSeleccionado.set(null);
    this.invResultados.set([]);
    this.invMensaje.set('');
    this.invError.set('');
  }

  eliminarInvitacion(idx: number): void {
    this.invitaciones.update(list => list.filter((_, i) => i !== idx));
  }

  // ── Submit ──

  onSubmit(): void {
    if (this.hasImagenesProductoErrors) return;
    if (!this.form.valid) return;

    const formValue = this.form.getRawValue();

    // Derivar idPlataforma del primer item de plataformaContenidos
    const pcs = this.plataformaContenidos();
    if (pcs.length > 0) {
      formValue.idPlataforma = String(pcs[0].idPlataforma);
    }

    if (formValue.esPresencial) {
      formValue.requiereProductoFisico = false;
      formValue.requiereProductoVirtual = false;
      formValue.envioProductoIncluido = false;
    }

    if (formValue.requiereProductoVirtual) {
      formValue.envioProductoIncluido = false;
    }

    this.saved.emit({
      form: formValue,
      categorias: this.selectedCategorias(),
      imagenesProducto: this.imagenesProducto(),
      plataformaContenidos: this.plataformaContenidos(),
      entregables: this.entregables(),
      invitaciones: this.invitaciones().map(i => ({
        idInfluencer: i.idInfluencer,
        mensaje: i.mensaje || null
      }))
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  private updateNotasLogisticasState(): void {
    const notasLogisticasControl = this.form.get('notasLogisticas');
    if (!notasLogisticasControl) return;

    if (this.requiereProductoVirtual) {
      notasLogisticasControl.setValue('', { emitEvent: false });
      notasLogisticasControl.disable({ emitEvent: false });
      return;
    }

    notasLogisticasControl.enable({ emitEvent: false });
  }

  private updateImagenesProductoState(): void {
    if (!this.requiereProductoFisico || this.esPresencial) {
      this.imagenesProducto.set([]);
      this.imagenesProductoErrors.set([]);
      this.clearImagenesProductoPreview();
    }
  }

  private setImagenesProductoPreview(files: File[]): void {
    this.clearImagenesProductoPreview();
    this.imagenesProductoPreview.set(
      files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        size: this.formatFileSize(file.size)
      }))
    );
  }

  private clearImagenesProductoPreview(): void {
    this.imagenesProductoPreview().forEach((preview) => URL.revokeObjectURL(preview.url));
    this.imagenesProductoPreview.set([]);
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }
}

