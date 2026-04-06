import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { InfluencerCosto, InfluencerCostoResponse } from '../../../../../models/types';
import { InfluencerService } from '../../../../../services/influencer.service';
import { CatalogService } from '../../../../../services/catalog.service';

@Component({
  selector: 'app-influencer-costos',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './influencer-costos.component.html'
})
export class InfluencerCostosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private influencerService = inject(InfluencerService);
  private catalogService = inject(CatalogService);

  plataformas = this.catalogService.plataformas;
  tiposContenido = this.catalogService.tiposContenido;
  costos = signal<InfluencerCostoResponse[]>([]);
  loading = signal(false);
  saving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  editingId = signal<number | null>(null);
  showForm = signal(false);
  selectedPlataforma = signal<number | null>(null);

  tiposContenidoDisponibles = computed(() => {
    const plat = this.selectedPlataforma();
    if (!plat) return this.tiposContenido();
    const editingCosto = this.editingId()
      ? this.costos().find(c => c.idInfluencerCosto === this.editingId())
      : null;
    const usados = this.costos()
      .filter(c => c.idPlataforma === plat)
      .filter(c => !editingCosto || c.idInfluencerCosto !== editingCosto.idInfluencerCosto)
      .map(c => c.idTipoContenido);
    return this.tiposContenido().filter(t => !usados.includes(t.idTipoContenido));
  });

  costForm = this.fb.nonNullable.group({
    idPlataforma: ['', Validators.required],
    idTipoContenido: ['', Validators.required],
    costoMin: [''],
    costoMax: [''],
    canje: [false]
  });

  ngOnInit(): void {
    this.cargarCostos();
    this.costForm.get('idPlataforma')!.valueChanges.subscribe(val => {
      this.selectedPlataforma.set(val ? Number(val) : null);
      this.costForm.get('idTipoContenido')!.setValue('');
    });
  }

  cargarCostos(): void {
    this.loading.set(true);
    this.influencerService.obtenerCostos().subscribe({
      next: (data) => {
        this.costos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Error al cargar los costos.');
      }
    });
  }

  abrirFormulario(): void {
    this.editingId.set(null);
    this.costForm.reset();
    this.showForm.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');
  }

  editarCosto(costo: InfluencerCostoResponse): void {
    this.editingId.set(costo.idInfluencerCosto);
    this.selectedPlataforma.set(costo.idPlataforma);
    this.costForm.patchValue({
      idPlataforma: String(costo.idPlataforma),
      idTipoContenido: String(costo.idTipoContenido),
      costoMin: String(costo.costoMin ?? ''),
      costoMax: String(costo.costoMax ?? ''),
      canje: costo.canje
    }, { emitEvent: false });
    this.showForm.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');
  }

  cancelar(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.costForm.reset();
  }

  eliminarCosto(costo: InfluencerCostoResponse): void {
    if (!confirm(`¿Estás seguro de eliminar el costo de ${costo.nombrePlataforma} - ${costo.nombreTipoContenido}?`)) return;
    this.successMsg.set('');
    this.errorMsg.set('');
    this.influencerService.eliminarCosto(costo.idPlataforma, costo.idTipoContenido).subscribe({
      next: () => {
        this.successMsg.set('Costo eliminado correctamente');
        this.cargarCostos();
      },
      error: () => {
        this.errorMsg.set('Error al eliminar el costo. Intentá de nuevo.');
      }
    });
  }

  guardarCosto(): void {
    if (this.costForm.valid) {
      this.saving.set(true);
      this.successMsg.set('');
      this.errorMsg.set('');
      const val = this.costForm.getRawValue();
      const costo: InfluencerCosto = {
        idPlataforma: Number(val.idPlataforma),
        idTipoContenido: Number(val.idTipoContenido),
        costoMin: val.costoMin ? Number(val.costoMin) : 0,
        costoMax: val.costoMax ? Number(val.costoMax) : 0,
        canje: val.canje
      };

      const obs$ = this.editingId()
        ? this.influencerService.actualizarCosto(costo)
        : this.influencerService.agregarCosto(costo);

      obs$.subscribe({
        next: () => {
          this.saving.set(false);
          this.successMsg.set(this.editingId() ? 'Costo actualizado correctamente' : 'Costo guardado correctamente');
          this.showForm.set(false);
          this.editingId.set(null);
          this.costForm.reset();
          this.cargarCostos();
        },
        error: () => {
          this.saving.set(false);
          this.errorMsg.set('Error al guardar el costo. Intentá de nuevo.');
        }
      });
    }
  }

  getPlatformIcon(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('instagram')) return '📸';
    if (n.includes('tiktok')) return '🎵';
    if (n.includes('youtube')) return '▶️';
    if (n.includes('twitter') || n.includes('x')) return '🐦';
    if (n.includes('facebook')) return '👤';
    return '🌐';
  }
}
