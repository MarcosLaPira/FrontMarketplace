import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Campana, CampanaCreateRequest, CampanaFilter } from '../models/types';
import { API_BASE_URL } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class CampanaService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/campanas`;

  // Create new campaign
  createCampana(request: CampanaCreateRequest, imagenesProducto: File[] = []): Observable<Campana> {
    return this.http.post<Campana>(`${this.apiUrl}/crear`, this.buildFormData(request, imagenesProducto));
  }

  // Get all campaigns with filters
  getCampanas(filters?: CampanaFilter): Observable<Campana[]> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    return this.http.get<Campana[]>(`${this.apiUrl}/`, { params });
  }

  // Get campaign by ID
  getCampanaById(id: number): Observable<Campana> {
    return this.http.get<Campana>(`${this.apiUrl}/${id}`);
  }

  // Update campaign
  updateCampana(id: number, request: Partial<CampanaCreateRequest>, imagenesProducto: File[] = []): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, this.buildFormData(request, imagenesProducto));
  }

  // Change campaign status
  cambiarEstado(id: number, nuevoEstado: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cambiar-estado/${id}`, { nuevoEstado });
  }

  // Get my campaigns
  getMisCampanas(): Observable<Campana[]> {
    return this.http.get<Campana[]>(`${this.apiUrl}/mis-campanas`);
  }

  invitarInfluencer(idCampana: number, idInfluencer: number, mensaje: string): Observable<any> {
    return this.http.post(`${API_BASE_URL}/invitaciones/crear`, { idCampana, idInfluencer, mensaje });
  }

  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private buildFormData(request: Partial<CampanaCreateRequest>, imagenesProducto: File[]): FormData {
    const formData = new FormData();

    Object.entries(request).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      const pcKey = this.toPascalCase(key);

      if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === 'object' && !(value[0] instanceof File)) {
          // Array de objetos: serializar con notación bracket+dot (ASP.NET Core model binding)
          value.forEach((item, idx) => {
            Object.entries(item).forEach(([itemKey, itemValue]) => {
              if (itemValue !== undefined && itemValue !== null) {
                const serialized = itemValue instanceof Date
                  ? (itemValue as Date).toISOString()
                  : String(itemValue);
                formData.append(`${pcKey}[${idx}].${this.toPascalCase(itemKey)}`, serialized);
              }
            });
          });
        } else {
          // Array de primitivos
          value.forEach((item) => formData.append(pcKey, String(item)));
        }
        return;
      }

      if (value instanceof Date) {
        formData.append(pcKey, value.toISOString());
        return;
      }

      formData.append(pcKey, String(value));
    });

    imagenesProducto.forEach((file) => {
      formData.append('ImagenesProducto', file, file.name);
    });

    return formData;
  }
}
