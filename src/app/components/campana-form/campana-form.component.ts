import { Component, inject, input, output, signal, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategorySelectorComponent } from '../category-selector/category-selector.component';
import { Categoria, Plataforma, Campana } from '../../models/types';

@Component({
  selector: 'app-campana-form',
  standalone: true,
  imports: [ReactiveFormsModule, CategorySelectorComponent],
  templateUrl: './campana-form.component.html'
})
export class CampanaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly maxImageSizeBytes = 5 * 1024 * 1024;

  categorias = input.required<Categoria[]>();
  plataformas = input.required<Plataforma[]>();
  campana = input<Campana | null>(null);

  saved = output<{ form: any; categorias: number[]; imagenesProducto: File[] }>();
  cancelled = output<void>();

  selectedCategorias = signal<number[]>([]);
  imagenesProducto = signal<File[]>([]);
  imagenesProductoPreview = signal<Array<{ name: string; url: string; size: string }>>([]);
  imagenesProductoErrors = signal<string[]>([]);

  form = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required],
    idPlataforma: ['', Validators.required],
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
    campanaPublica: [false],
    cantidadInfluencers: ['', Validators.required]
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
        cantidadInfluencers: String(c.cantidadInfluencers ?? '')
      });
      this.selectedCategorias.set(c.categorias?.map(cat => cat.idCategoria) || []);
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
  }

  ngOnDestroy(): void {
    this.clearImagenesProductoPreview();
  }

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
      // Evitar duplicados por nombre y tamaño
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
      // Revoke URL para liberar memoria
      URL.revokeObjectURL(previews[idx].url);
      const newFiles = files.slice(0, idx).concat(files.slice(idx + 1));
      this.imagenesProducto.set(newFiles);
      this.setImagenesProductoPreview(newFiles);
    }
  }

  toggleCategoria(id: number): void {
    const current = this.selectedCategorias();
    if (current.includes(id)) {
      this.selectedCategorias.set(current.filter(c => c !== id));
    } else {
      this.selectedCategorias.set([...current, id]);
    }
  }

  onSubmit(): void {
    if (this.hasImagenesProductoErrors) {
      return;
    }

    if (this.form.valid) {
      const formValue = this.form.getRawValue();

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
        imagenesProducto: this.imagenesProducto()
      });
    }
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
    if (!notasLogisticasControl) {
      return;
    }

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
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }
}
