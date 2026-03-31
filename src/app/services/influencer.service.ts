import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Influencer,
  InfluencerCosto,
  InfluencerEstadistica,
  PaginatedResponse
} from '../models/types';
import { API_BASE_URL } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class InfluencerService {

  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/influencers`;

  // Inicia el flujo OAuth para Instagram o TikTok
  startOAuth(provider: 'instagram' | 'tiktok'): Observable<string> {
    return this.http.get<{ url: string }>(`${this.apiUrl}/oauth/${provider}/start`).pipe(
      // Devuelve solo la URL de redirección
      map(res => res.url)
    );
  }

  // Get influencer by ID
  getInfluencerById(id: number): Observable<Influencer> {
    return this.http.get<Influencer>(`${this.apiUrl}/ObtenerInfluencerById`, {
      headers: { 'IdInfluencer': id.toString() }
    });
  }

  // Get all influencers with filters
  getInfluencers(filters?: {
    idsCategorias?: number[];
    nombreSocial?: string;
    esCuentaVerificada?: boolean;
    page?: number;
    pageSize?: number;
  }): Observable<PaginatedResponse<Influencer>> {
    let params = new HttpParams();
    if (filters) {
      if (filters.idsCategorias?.length) {
        for (const id of filters.idsCategorias) {
          params = params.append('idsCategorias', id.toString());
        }
      }
      if (filters.nombreSocial) params = params.set('nombreSocial', filters.nombreSocial);
      if (filters.esCuentaVerificada !== undefined) params = params.set('esCuentaVerificada', filters.esCuentaVerificada.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    }
    return this.http.get<PaginatedResponse<Influencer>>(`${this.apiUrl}/ObtenerInfluencers`, { params });
  }

  // Update statistics
  updateEstadisticas(idPlataforma: number, estadisticas: InfluencerEstadistica): Observable<any> {
    return this.http.put(`${this.apiUrl}/ActualizarEstadisticas`, {
      idPlataforma,
      seguidores: estadisticas.seguidores,
      alcancePromedio: estadisticas.alcancePromedio,
      engagementRate: estadisticas.engagementRate
    });
  }

  // Update influencer profile
  updateInfluencer(data: Partial<Influencer>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/ActualizarInfluencer`, data);
  }

  // Add cost per platform
  agregarCosto(idPlataforma: number, costo: InfluencerCosto): Observable<any> {
    return this.http.post(`${this.apiUrl}/AgregarCostoDeInfluncerPorPlataforma`, costo, {
      params: new HttpParams().set('IdPlataforma', idPlataforma.toString())
    });
  }

  // Update cost per platform
  actualizarCosto(idPlataforma: number, costo: InfluencerCosto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/ActualizarCostoDeInfluncerPorPlataforma`, costo, {
      params: new HttpParams().set('IdPlataforma', idPlataforma.toString())
    });
  }
}
