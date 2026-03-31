import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Campana, CampanaCreateRequest } from '../models/types';
import { API_BASE_URL } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class CampanaService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/campanas`;

  // Create new campaign
  createCampana(request: CampanaCreateRequest, imagenesProducto: File[] = []): Observable<Campana> {
    if (imagenesProducto.length > 0) {
      return this.http.post<Campana>(`${this.apiUrl}/crear`, this.buildFormData(request, imagenesProducto));
    }

    return this.http.post<Campana>(`${this.apiUrl}/crear`, request);
  }

  // Get all campaigns with filters
  getCampanas(filters?: {
    idMarca?: number;
    idPlataforma?: number;
    idEstadoCampana?: number;
    IdCategoria?: number;
  }): Observable<Campana[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.idMarca) params = params.set('idMarca', filters.idMarca.toString());
      if (filters.idPlataforma) params = params.set('idPlataforma', filters.idPlataforma.toString());
      if (filters.idEstadoCampana) params = params.set('idEstadoCampana', filters.idEstadoCampana.toString());
      if (filters.IdCategoria) params = params.set('IdCategoria', filters.IdCategoria.toString());
    }
    return this.http.get<Campana[]>(`${this.apiUrl}/`, { params });
  }

  // Get campaign by ID
  getCampanaById(id: number): Observable<Campana> {
    return this.http.get<Campana>(`${this.apiUrl}/${id}`);
  }

  // Update campaign
  updateCampana(id: number, request: Partial<CampanaCreateRequest>, imagenesProducto: File[] = []): Observable<any> {
    if (imagenesProducto.length > 0) {
      return this.http.put(`${this.apiUrl}/actualizar/${id}`, this.buildFormData(request, imagenesProducto));
    }

    return this.http.put(`${this.apiUrl}/actualizar/${id}`, request);
  }

  // Change campaign status
  cambiarEstado(id: number, nuevoEstado: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cambiar-estado/${id}`, { nuevoEstado });
  }

  // Get my campaigns
  getMisCampanas(): Observable<Campana[]> {
    return this.http.get<Campana[]>(`${this.apiUrl}/mis-campanas`);
  }

  private buildFormData(request: Partial<CampanaCreateRequest>, imagenesProducto: File[]): FormData {
    const formData = new FormData();

    Object.entries(request).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, String(item)));
        return;
      }

      if (value instanceof Date) {
        formData.append(key, value.toISOString());
        return;
      }

      formData.append(key, String(value));
    });

    imagenesProducto.forEach((file) => {
      formData.append('imagenesProducto', file, file.name);
    });

    return formData;
  }
}
