import { Component, inject, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CategorySelectorComponent } from '../../../../../components/category-selector/category-selector.component';
import { Categoria, UserProfile } from '../../../../../models/types';
import { InfluencerService } from '../../../../../services/influencer.service';

@Component({
  selector: 'app-influencer-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, CategorySelectorComponent],
  templateUrl: './influencer-perfil.component.html'
})
export class InfluencerPerfilComponent {
  private fb = inject(FormBuilder);
  private influencerService = inject(InfluencerService);

  userProfile = input.required<UserProfile | null>();
  categorias = input.required<Categoria[]>();

  profileUpdated = output<void>();

  editMode = signal(false);
  influencerCategorias = signal<number[]>([]);

  editForm = this.fb.nonNullable.group({
    nombre: [''],
    apellido: [''],
    nombreSocial: [''],
    descripcionPresentacion: ['']
  });

  toggleCategoria(id: number): void {
    const current = this.influencerCategorias();
    if (current.includes(id)) {
      this.influencerCategorias.set(current.filter(c => c !== id));
    } else {
      this.influencerCategorias.set([...current, id]);
    }
  }

  saveProfile(): void {
    if (this.editForm.valid) {
      const data = { ...this.editForm.getRawValue(), idsCategorias: this.influencerCategorias() };
      this.influencerService.updateInfluencer(data as any).subscribe({
        next: () => {
          this.editMode.set(false);
          this.profileUpdated.emit();
        },
        error: (err: any) => console.error('Error updating profile:', err)
      });
    }
  }
}
