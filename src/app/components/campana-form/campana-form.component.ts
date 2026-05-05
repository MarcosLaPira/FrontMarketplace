import { Component, inject, input, output, signal, OnDestroy, OnInit, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CategorySelectorComponent } from '../category-selector/category-selector.component';
import { CampanaAlcancePreviewComponent } from '../campana-alcance-preview/campana-alcance-preview.component';
import { CampanaPlataformasSectionComponent } from '../campana-plataformas-section/campana-plataformas-section.component';
import { CampanaEntregablesSectionComponent } from '../campana-entregables-section/campana-entregables-section.component';
import { CampanaInvitacionesSectionComponent } from '../campana-invitaciones-section/campana-invitaciones-section.component';
import {
  Categoria,
  Plataforma,
  TipoContenido,
  Campana,
  PlataformaContenidoInput,
  EntregableInput,
  InvitacionInput,
  CampanaPlataformaContenido,
  CampanaEntregable,
  InvitacionCampana,
  CampanaSugerencias,
  ObjetivoCampana,
  NivelAlcance
} from '../../models/types';
import { WIZARD_SUGERENCIAS, Advertencia, KPI_OPTIONS, KPI_LABELS } from '../../shared/campana-benchmarks';

interface InvitacionDisplay {
  idInfluencer: number;
  nombreSocial: string;
  mensaje: string;
}

@Component({
  selector: 'app-campana-form',
  standalone: true,
  imports: [ReactiveFormsModule, CategorySelectorComponent, DecimalPipe, CampanaAlcancePreviewComponent, CampanaPlataformasSectionComponent, CampanaEntregablesSectionComponent, CampanaInvitacionesSectionComponent],
  templateUrl: './campana-form.component.html'
})
export class CampanaFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly maxImageSizeBytes = 5 * 1024 * 1024;

  categorias = input.required<Categoria[]>();
  plataformas = input.required<Plataforma[]>();
  tiposContenido = input.required<TipoContenido[]>();
  campana = input<Campana | null>(null);
  sugerencias = input<CampanaSugerencias | null>(null);
  objetivoCampanaWizard = input<ObjetivoCampana | null>(null);
  nivelAlcanceWizard = input<NivelAlcance | null>(null);
  presupuestoInicial = input<number | null>(null);
  cantidadInfluencersInicial = input<number | null>(null);
  minimoSeguidoresInicial = input<number | null>(null);

  saved = output<{
    form: any;
    categorias: number[];
    imagenesProducto: File[];
    plataformaContenidos: PlataformaContenidoInput[];
    entregables: EntregableInput[];
    invitaciones: InvitacionInput[];
    hashtags: string[];
    kpisEsperados: string[];
  }>();
  cancelled = output<void>();

  selectedCategorias = signal<number[]>([]);
  imagenesProducto = signal<File[]>([]);
  imagenesProductoPreview = signal<Array<{ name: string; url: string; size: string }>>([]);
  imagenesProductoErrors = signal<string[]>([]);

  // ── Plataforma + Tipo Contenido ──
  plataformaContenidos = signal<PlataformaContenidoInput[]>([]);

  // ── Entregables ──
  entregables = signal<EntregableInput[]>([]);

  // ── Invitaciones ──
  invitaciones = signal<InvitacionDisplay[]>([]);

  // ── Nuevos campos ──
  kpisSeleccionados = signal<string[]>([]);
  hashtagsSeleccionados = signal<string[]>([]);
  nuevaHashtag = signal<string>('');

  // ── Secciones colapsables ──
  seccionSeguidoresOpen = signal(false);
  seccionContenidoOpen = signal(false);
  seccionBriefingOpen = signal(false);
  seccionProductoOpen = signal(false);
  seccionEntregablesOpen = signal(false);
  seccionInvitacionesOpen = signal(false);

  // ── Constantes expuestas al template ──
  readonly kpiOptions = KPI_OPTIONS;
  readonly kpiLabels = KPI_LABELS;

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
    esExcluyenteMinimoSeguidores: [false],
    // Nuevos campos
    publicoObjetivo: [''],
    tonoComunicacion: [null as string | null],
    tipoPago: ['monetario'],
    mencionObligatoria: ['']
  });

  // ── Computed: advertencias semáforo ──
  advertencias = computed<Advertencia[]>(() => {
    const warns: Advertencia[] = [];
    const presupuesto = Number(this.form.get('presupuesto')?.value ?? 0);
    const minSeg = Number(this.form.get('minimoSeguidores')?.value ?? 0);
    const cantidad = Number(this.form.get('cantidadInfluencers')?.value ?? 0);
    const fechaInicio = this.form.get('fechaInicio')?.value;
    const fechaFin = this.form.get('fechaFin')?.value;
    const entregables = this.entregables();
    const pcs = this.plataformaContenidos();

    if (presupuesto > 0 && minSeg > 100000 && presupuesto < 200000) {
      warns.push({ tipo: 'warning', mensaje: 'Con este presupuesto y ese mínimo de seguidores, pocos influencers podrían postularse.' });
    }
    if (fechaInicio && fechaFin && entregables.length > 0) {
      const dias = (new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / 86400000;
      if (dias < 7 && entregables.length > 2) {
        warns.push({ tipo: 'warning', mensaje: `${entregables.length} entregables en menos de 7 días es muy ajustado para los influencers.` });
      }
    }
    if (this.form.get('campanaPublica')?.value && pcs.length === 0) {
      warns.push({ tipo: 'info', mensaje: 'Definir plataforma y tipo de contenido mejora la tasa de postulación.' });
    }
    if (minSeg > 300000 && cantidad > 3) {
      warns.push({ tipo: 'info', mensaje: 'Para influencers grandes, trabajar con 1–3 suele dar mejores resultados y más control creativo.' });
    }
    return warns;
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

  // ── Getters para live preview (zone-based CD) ──
  get presupuestoVal(): number { return Number(this.form.get('presupuesto')?.value ?? 0); }
  get cantidadInfluencersVal(): number { return Number(this.form.get('cantidadInfluencers')?.value ?? 0); }
  get minimoSeguidoresVal(): number | null {
    const v = this.form.get('minimoSeguidores')?.value;
    return v ? Number(v) : null;
  }
  get presupuestoPorInfluencerVal(): number | null {
    const p = this.presupuestoVal;
    const c = this.cantidadInfluencersVal;
    return p > 0 && c > 0 ? Math.round(p / c) : null;
  }

  get presupuestoActual(): number {
    return Number(this.form.get('presupuesto')?.value ?? 0);
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
        esExcluyenteMinimoSeguidores: c.esExcluyenteMinimoSeguidores ?? false,
        publicoObjetivo: c.publicoObjetivo ?? '',
        tonoComunicacion: c.tonoComunicacion ?? null,
        tipoPago: c.tipoPago ?? 'monetario',
        mencionObligatoria: c.mencionObligatoria ?? ''
      });
      this.selectedCategorias.set(c.categorias?.map(cat => cat.idCategoria) || []);
      if (c.kpisEsperados?.length) this.kpisSeleccionados.set(c.kpisEsperados);
      if (c.hashtags?.length) this.hashtagsSeleccionados.set(c.hashtags);

      // Pre-cargar plataformaContenidos (selección única)
      if (c.plataformaContenidos?.length) {
        const pc = c.plataformaContenidos[0] as CampanaPlataformaContenido;
        this.plataformaContenidos.set([
          {
            idPlataforma: pc.idPlataforma,
            idTipoContenido: pc.idTipoContenido,
            precio: pc.precio
          }
        ]);
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

    // Aplicar sugerencias del wizard (solo en modo creación)
    if (!c) {
      const sug = this.sugerencias();
      if (sug) {
        this.form.patchValue({
          presupuesto: String(sug.presupuestoSugerido),
          cantidadInfluencers: String(sug.cantidadInfluencersSugerida),
          minimoSeguidores: sug.minimoSeguidoresSugerido
        });
        this.kpisSeleccionados.set([...sug.kpisSugeridos]);
      }
      // Valores tweakeados en wizard tienen prioridad
      const presInicial = this.presupuestoInicial();
      const cantInicial = this.cantidadInfluencersInicial();
      if (presInicial != null) this.form.patchValue({ presupuesto: String(presInicial) });
      if (cantInicial != null) this.form.patchValue({ cantidadInfluencers: String(cantInicial) });
      const minSegInicial = this.minimoSeguidoresInicial();
      if (minSegInicial != null) {
        this.form.patchValue({ minimoSeguidores: minSegInicial });
        this.seccionSeguidoresOpen.set(true);
      }
    }

    // En edición, abrir secciones que tienen datos
    if (c) {
      if (c.minimoSeguidores) this.seccionSeguidoresOpen.set(true);
      if (c.plataformaContenidos?.length) this.seccionContenidoOpen.set(true);
      if (c.publicoObjetivo || c.tonoComunicacion || c.hashtags?.length) this.seccionBriefingOpen.set(true);
      if (c.esPresencial || c.requiereProductoFisico || c.requiereProductoVirtual) this.seccionProductoOpen.set(true);
      if (c.entregables?.length) this.seccionEntregablesOpen.set(true);
      if (c.invitacionesCampana?.length) this.seccionInvitacionesOpen.set(true);
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

  // ── Invitaciones ──

  // ── KPIs ──
  toggleKpi(kpi: string): void {
    const current = this.kpisSeleccionados();
    if (current.includes(kpi)) {
      this.kpisSeleccionados.set(current.filter(k => k !== kpi));
    } else {
      this.kpisSeleccionados.set([...current, kpi]);
    }
  }

  // ── Hashtags ──
  agregarHashtag(): void {
    let tag = this.nuevaHashtag().trim();
    if (!tag) return;
    if (!tag.startsWith('#')) tag = '#' + tag;
    const current = this.hashtagsSeleccionados();
    if (current.includes(tag)) return;
    this.hashtagsSeleccionados.update(list => [...list, tag]);
    this.nuevaHashtag.set('');
  }

  eliminarHashtag(tag: string): void {
    this.hashtagsSeleccionados.update(list => list.filter(h => h !== tag));
  }

  onHashtagKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.agregarHashtag();
    }
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
      form: {
        ...formValue,
        objetivoCampana: this.objetivoCampanaWizard(),
        nivelAlcanceObjetivo: this.nivelAlcanceWizard()
      },
      categorias: this.selectedCategorias(),
      imagenesProducto: this.imagenesProducto(),
      plataformaContenidos: this.plataformaContenidos(),
      entregables: this.entregables(),
      invitaciones: this.invitaciones().map(i => ({
        idInfluencer: i.idInfluencer,
        mensaje: i.mensaje || null
      })),
      hashtags: this.hashtagsSeleccionados(),
      kpisEsperados: this.kpisSeleccionados()
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

