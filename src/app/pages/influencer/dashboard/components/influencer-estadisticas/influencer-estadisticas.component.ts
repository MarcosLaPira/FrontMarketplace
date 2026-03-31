import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Plataforma, InfluencerEstadistica } from '../../../../../models/types';
import { InfluencerService } from '../../../../../services/influencer.service';
import { CatalogService } from '../../../../../services/catalog.service';

@Component({
  selector: 'app-influencer-estadisticas',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './influencer-estadisticas.component.html'
})
export class InfluencerEstadisticasComponent {
  private fb = inject(FormBuilder);
  private influencerService = inject(InfluencerService);
  private catalogService = inject(CatalogService);

  plataformas = this.catalogService.plataformas;

  estadisticasForm = this.fb.nonNullable.group({
    idPlataforma: ['', Validators.required],
    seguidores: ['', Validators.required],
    alcancePromedio: ['', Validators.required],
    engagementRate: ['', Validators.required]
  });

  agregarEstadistica(): void {
    if (this.estadisticasForm.valid) {
      const val = this.estadisticasForm.getRawValue();
      const estadistica: InfluencerEstadistica = {
        idPlataforma: Number(val.idPlataforma),
        seguidores: Number(val.seguidores),
        alcancePromedio: Number(val.alcancePromedio),
        engagementRate: Number(val.engagementRate)
      };
      this.influencerService.updateEstadisticas(estadistica.idPlataforma, estadistica).subscribe({
        next: () => this.estadisticasForm.reset(),
        error: (err: any) => console.error('Error adding statistics:', err)
      });
    }
  }
}
