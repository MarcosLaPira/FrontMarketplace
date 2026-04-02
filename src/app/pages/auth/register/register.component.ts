import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CatalogService } from '../../../services/catalog.service';
import { CategorySelectorComponent } from '../../../components/category-selector/category-selector.component';
import { InfluencerSocialConnectComponent } from '../../../components/influencer-social-connect/influencer-social-connect.component';
import { InfluencerRegisterRequest, MarcaRegisterRequest } from '../../../models/types';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CategorySelectorComponent, InfluencerSocialConnectComponent],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private catalogService = inject(CatalogService);

  registerType = signal<'influencer' | 'marca' | null>(null);
  loading = signal(false);
  error = signal('');
  success = signal('');

  categories = this.catalogService.categorias;
  selectedCategorias = signal<number[]>([]);
  fotoPerfilFile = signal<File | null>(null);
  fotoPerfilPreview = signal<string | null>(null);

  influencerForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    nombreSocial: ['', [Validators.required]],
    descripcion: [''],
    generoAudiencia: [''],
    seguidoresTotales: [null as number | null],
    esCuentaVerificada: [false]
  });

  marcaForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    nombreComercial: ['', [Validators.required]],
    descripcion: [''],
    ubicacionPais: ['', [Validators.required]],
    ubicacionCiudad: ['', [Validators.required]],
    webUrl: ['']
  });

  toggleCategoria(id: number): void {
    const current = this.selectedCategorias();
    if (current.includes(id)) {
      this.selectedCategorias.set(current.filter(c => c !== id));
    } else {
      this.selectedCategorias.set([...current, id]);
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

  onRegister(): void {
    if (this.selectedCategorias().length === 0) {
      this.error.set('Selecciona al menos una categoría');
      return;
    }
    if (this.registerType() === 'influencer') {
      if (this.influencerForm.invalid) { this.error.set('Por favor completa todos los campos'); return; }
      this.registerInfluencer();
    } else if (this.registerType() === 'marca') {
      if (this.marcaForm.invalid) { this.error.set('Por favor completa todos los campos'); return; }
      this.registerMarca();
    }
  }

  private registerInfluencer(): void {
    this.loading.set(true);
    this.error.set('');
    const val = this.influencerForm.getRawValue();
    const request: InfluencerRegisterRequest = {
      ...val,
      seguidoresTotales: val.seguidoresTotales ?? undefined,
      idsCategorias: this.selectedCategorias(),
      fotoPerfil: this.fotoPerfilFile() ?? undefined
    };
    this.authService.registerInfluencer(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Influencer registrado exitosamente. Redirigiendo a login...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al registrar influencer');
      }
    });
  }

  private registerMarca(): void {
    this.loading.set(true);
    this.error.set('');
    const val = this.marcaForm.getRawValue();
    const request: MarcaRegisterRequest = {
      ...val,
      idsCategorias: this.selectedCategorias()
    };
    this.authService.registerMarca(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Marca registrada exitosamente. Redirigiendo a login...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al registrar marca');
      }
    });
  }
}
