import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Marca } from '../models/types';
import { API_BASE_URL } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/marca`;

  // Get marca by ID
  getMarcaById(id: number): Observable<Marca> {
    return this.http.get<Marca>(`${this.apiUrl}/ObtnerMarcaByIdMarca`, {
      headers: { 'IdMarca': id.toString() }
    });
  }

  // Get all marcas with filters
  getMarcas(filters?: {
    nombre?: string;
    idsCategorias?: number[];
    ubicacionPais?: string;
    ubicacionCiudad?: string;
    esActivo?: boolean;
  }): Observable<Marca[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.nombre) params = params.set('nombre', filters.nombre);
      if (filters.idsCategorias?.length) {
        for (const id of filters.idsCategorias) {
          params = params.append('idsCategorias', id.toString());
        }
      }
      if (filters.ubicacionPais) params = params.set('ubicacionPais', filters.ubicacionPais);
      if (filters.ubicacionCiudad) params = params.set('ubicacionCiudad', filters.ubicacionCiudad);
      if (filters.esActivo !== undefined) params = params.set('esActivo', filters.esActivo.toString());
    }
    return this.http.get<Marca[]>(`${this.apiUrl}/ObtenerMarcas`, { params });
  }

  // Get current user's marca
  getMyMarca(): Observable<Marca> {
    return this.http.get<Marca>(`${this.apiUrl}/ObtenerMarcaByIdUsuario`);
  }

  // Update marca
  updateMarca(data: Partial<Marca>): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar`, data);
  }

  // Delete marca (soft delete)
  deleteMarca(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar`);
  }
}
