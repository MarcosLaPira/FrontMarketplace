import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../shared/constants';
import { Categoria, Plataforma, EstadoCampana, TipoContenido } from '../models/types';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/catalogos`;

  plataformas = signal<Plataforma[]>([]);
  categorias = signal<Categoria[]>([]);
  estadosCampana = signal<EstadoCampana[]>([]);
  tiposContenido = signal<TipoContenido[]>([]);

  loadCatalogs(): void {
    this.http.get<any>(`${this.apiUrl}/plataformas`).subscribe({
      next: (data) => {
        console.log('Plataformas raw response:', data);
        const items = Array.isArray(data) ? data : (data?.value || data?.Value || []);
        this.plataformas.set(items);
      },
      error: (err) => console.error('Error loading plataformas:', err)
    });
    this.http.get<any>(`${this.apiUrl}/categorias`).subscribe({
      next: (data) => {
        console.log('Categorias raw response:', data);
        const items = Array.isArray(data) ? data : (data?.value || data?.Value || []);
        this.categorias.set(items);
      },
      error: (err) => console.error('Error loading categorias:', err)
    });
    this.http.get<any>(`${this.apiUrl}/estado-campanas`).subscribe({
      next: (data) => {
        console.log('EstadosCampana raw response:', data);
        const items = Array.isArray(data) ? data : (data?.value || data?.Value || []);
        this.estadosCampana.set(items);
      },
      error: (err) => console.error('Error loading estados campana:', err)
    });
    this.http.get<any>(`${this.apiUrl}/tipos-contenido`).subscribe({
      next: (data) => {
        const items = Array.isArray(data) ? data : (data?.value || data?.Value || []);
        this.tiposContenido.set(items);
      },
      error: (err) => console.error('Error loading tipos contenido:', err)
    });
  }

  getPlatformName(idPlataforma: number): string {
    return this.plataformas().find(p => p.idPlataforma === idPlataforma)?.nombrePlataforma || '';
  }

  getCategoryName(idCategoria: number): string {
    return this.categorias().find(c => c.idCategoria === idCategoria)?.nombre || '';
  }

  getCategoryNames(categorias: Categoria[]): string {
    return categorias.map(c => c.nombre).join(', ');
  }
}
