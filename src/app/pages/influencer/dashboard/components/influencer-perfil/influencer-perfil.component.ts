import { Component, OnInit, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CategorySelectorComponent } from '../../../../../components/category-selector/category-selector.component';
import { Categoria, InfluencerDetalle } from '../../../../../models/types';
import { InfluencerService } from '../../../../../services/influencer.service';
import { API_BASE_URL } from '../../../../../shared/constants';

@Component({
  selector: 'app-influencer-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, CategorySelectorComponent, DatePipe, DecimalPipe],
  templateUrl: './influencer-perfil.component.html'
})
export class InfluencerPerfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private influencerService = inject(InfluencerService);

  categorias = input.required<Categoria[]>();

  perfil = signal<InfluencerDetalle | null>(null);
  editMode = signal(false);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  successMsg = signal('');

  influencerCategorias = signal<number[]>([]);
  fotoPerfilFile = signal<File | null>(null);
  fotoPerfilPreview = signal<string | null>(null);

  editForm = this.fb.nonNullable.group({
    nombreSocial: [''],
    descripcion: [''],
    generoAudiencia: [''],
    esCuentaVerificada: [false]
  });

  ngOnInit(): void {
    this.loadPerfil();
  }

  loadPerfil(): void {
    this.loading.set(true);
    this.influencerService.getMiPerfil().subscribe({
      next: (data) => {
        this.perfil.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el perfil');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  getFotoPerfilUrl(): string | null {
    const foto = this.perfil()?.fotoPerfil;
    if (!foto) return null;
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${foto}`;
  }

  enterEditMode(): void {
    const p = this.perfil();
    if (!p) return;
    this.editForm.patchValue({
      nombreSocial: p.nombreSocial || '',
      descripcion: p.descripcionPresentacion || '',
      generoAudiencia: p.generoAudiencia || '',
      esCuentaVerificada: p.esCuentaVerificada
    });
    this.influencerCategorias.set(p.categorias?.map(c => c.idCategoria) || []);
    this.fotoPerfilFile.set(null);
    this.fotoPerfilPreview.set(null);
    this.editMode.set(true);
    this.error.set('');
    this.successMsg.set('');
  }

  cancelEdit(): void {
    this.editMode.set(false);
    this.fotoPerfilFile.set(null);
    this.fotoPerfilPreview.set(null);
  }

  toggleCategoria(id: number): void {
    const current = this.influencerCategorias();
    if (current.includes(id)) {
      this.influencerCategorias.set(current.filter(c => c !== id));
    } else {
      this.influencerCategorias.set([...current, id]);
    }
  }

  onFotoPerfilSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fotoPerfilFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.fotoPerfilPreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    if (this.editForm.valid) {
      this.saving.set(true);
      this.error.set('');
      const val = this.editForm.getRawValue();
      const data = {
        nombreSocial: val.nombreSocial,
        descripcion: val.descripcion,
        generoAudiencia: val.generoAudiencia || undefined,
        esCuentaVerificada: val.esCuentaVerificada,
        idsCategorias: this.influencerCategorias(),
        fotoPerfil: this.fotoPerfilFile() ?? undefined
      };
      this.influencerService.updateInfluencer(data).subscribe({
        next: () => {
          this.saving.set(false);
          this.editMode.set(false);
          this.successMsg.set('Perfil actualizado correctamente');
          this.loadPerfil();
        },
        error: (err: any) => {
          this.saving.set(false);
          this.error.set(err.error?.message || 'Error al actualizar perfil');
        }
      });
    }
  }
}
