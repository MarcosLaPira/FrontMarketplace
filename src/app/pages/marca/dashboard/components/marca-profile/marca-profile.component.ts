import { Component, inject, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategorySelectorComponent } from '../../../../../components/category-selector/category-selector.component';
import { Marca, Categoria, UserProfile } from '../../../../../models/types';
import { MarcaService } from '../../../../../services/marca.service';

@Component({
  selector: 'app-marca-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CategorySelectorComponent],
  templateUrl: './marca-profile.component.html'
})
export class MarcaProfileComponent {
  private fb = inject(FormBuilder);
  private marcaService = inject(MarcaService);

  marca = input.required<Marca | null>();
  userProfile = input<UserProfile | null>(null);
  categorias = input.required<Categoria[]>();

  profileUpdated = output<void>();

  editMode = signal(false);
  loading = signal(false);
  marcaCategorias = signal<number[]>([]);

  editForm = this.fb.nonNullable.group({
    nombreComercial: ['', Validators.required],
    descripcion: [''],
    ubicacionPais: ['', Validators.required],
    ubicacionCiudad: ['', Validators.required],
    webUrl: ['']
  });

  toggleEditMode(): void {
    if (this.editMode()) {
      this.resetForm();
    } else {
      this.loadForm();
    }
    this.editMode.update(v => !v);
  }

  toggleCategoria(id: number): void {
    const current = this.marcaCategorias();
    if (current.includes(id)) {
      this.marcaCategorias.set(current.filter(c => c !== id));
    } else {
      this.marcaCategorias.set([...current, id]);
    }
  }

  saveProfile(): void {
    if (this.editForm.valid && this.marca()) {
      this.loading.set(true);
      const val = this.editForm.getRawValue();
      this.marcaService.updateMarca({ ...val, idsCategorias: this.marcaCategorias() } as any).subscribe({
        next: () => {
          this.editMode.set(false);
          this.loading.set(false);
          this.profileUpdated.emit();
        },
        error: (err: any) => {
          console.error('Error updating marca:', err);
          this.loading.set(false);
        }
      });
    }
  }

  private loadForm(): void {
    const m = this.marca();
    if (m) {
      this.marcaCategorias.set(m.categorias?.map(c => c.idCategoria) || []);
      this.editForm.patchValue({
        nombreComercial: m.nombreComercial,
        descripcion: m.descripcion || '',
        ubicacionPais: m.ubicacionPais,
        ubicacionCiudad: m.ubicacionCiudad,
        webUrl: m.webUrl || ''
      });
    }
  }

  private resetForm(): void {
    this.loadForm();
  }
}
