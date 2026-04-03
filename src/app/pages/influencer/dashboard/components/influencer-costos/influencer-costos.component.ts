import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InfluencerCosto } from '../../../../../models/types';
import { InfluencerService } from '../../../../../services/influencer.service';
import { CatalogService } from '../../../../../services/catalog.service';

@Component({
  selector: 'app-influencer-costos',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './influencer-costos.component.html'
})
export class InfluencerCostosComponent {
  private fb = inject(FormBuilder);
  private influencerService = inject(InfluencerService);
  private catalogService = inject(CatalogService);

  plataformas = this.catalogService.plataformas;
  saving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  costForm = this.fb.nonNullable.group({
    idPlataforma: ['', Validators.required],
    costoMin: ['', Validators.required],
    costoMax: ['', Validators.required],
    canje: [false]
  });

  agregarCosto(): void {
    if (this.costForm.valid) {
      this.saving.set(true);
      this.successMsg.set('');
      this.errorMsg.set('');
      const val = this.costForm.getRawValue();
      const costo: InfluencerCosto = {
        idPlataforma: Number(val.idPlataforma),
        costoMin: Number(val.costoMin),
        costoMax: Number(val.costoMax),
        canje: val.canje
      };
      this.influencerService.agregarCosto(costo.idPlataforma, costo).subscribe({
        next: () => {
          this.saving.set(false);
          this.successMsg.set('Costo guardado correctamente');
          this.costForm.reset();
        },
        error: () => {
          this.saving.set(false);
          this.errorMsg.set('Error al guardar el costo. Intentá de nuevo.');
        }
      });
    }
  }
}
