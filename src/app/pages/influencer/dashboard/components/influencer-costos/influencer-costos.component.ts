import { Component, inject } from '@angular/core';
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

  costForm = this.fb.nonNullable.group({
    idPlataforma: ['', Validators.required],
    costoMin: ['', Validators.required],
    costoMax: ['', Validators.required],
    canje: [false]
  });

  agregarCosto(): void {
    if (this.costForm.valid) {
      const val = this.costForm.getRawValue();
      const costo: InfluencerCosto = {
        idPlataforma: Number(val.idPlataforma),
        costoMin: Number(val.costoMin),
        costoMax: Number(val.costoMax),
        canje: val.canje
      };
      this.influencerService.agregarCosto(costo.idPlataforma, costo).subscribe({
        next: () => this.costForm.reset(),
        error: (err: any) => console.error('Error adding cost:', err)
      });
    }
  }
}
