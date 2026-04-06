import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Influencer,
  InfluencerDetalle,
  InfluencerCosto,
  InfluencerCostoResponse,
  InfluencerEstadistica,
  InfluencerFilter,
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

  // Get my influencer profile (authenticated)
  getMiPerfil(): Observable<InfluencerDetalle> {
    return this.http.get<InfluencerDetalle>(`${this.apiUrl}/mi-perfil`);
  }

  // Get influencer by ID
  getInfluencerById(id: number): Observable<InfluencerDetalle> {
    return this.http.get<InfluencerDetalle>(`${this.apiUrl}/ObtenerInfluencerById`, {
      headers: { 'idInfluencer': id.toString() }
    });
  }

  // Get all influencers with filters
  getInfluencers(filters?: InfluencerFilter): Observable<PaginatedResponse<Influencer>> {
    const body: Record<string, any> = {};
    if (filters) {
      if (filters.idsCategorias?.length) body['idsCategorias'] = filters.idsCategorias;
      if (filters.plataformaId) body['plataformaId'] = filters.plataformaId;
      if (filters.seguidoresMin != null) body['seguidoresMin'] = filters.seguidoresMin;
      if (filters.seguidoresMax != null) body['seguidoresMax'] = filters.seguidoresMax;
      if (filters.costoMin != null) body['costoMin'] = filters.costoMin;
      if (filters.costoMax != null) body['costoMax'] = filters.costoMax;
      if (filters.soloCanje != null) body['soloCanje'] = filters.soloCanje;
      if (filters.soloVerificados != null) body['soloVerificados'] = filters.soloVerificados;
      if (filters.generoAudiencia) body['generoAudiencia'] = filters.generoAudiencia;
      if (filters.ratingMin != null) body['ratingMin'] = filters.ratingMin;
      if (filters.search) body['search'] = filters.search;
      if (filters.page) body['page'] = filters.page;
      if (filters.pageSize) body['pageSize'] = filters.pageSize;
    }
    return this.http.post<PaginatedResponse<Influencer>>(`${this.apiUrl}/ObtenerInfluencers`, body);
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

  // Update influencer profile (FormData for file upload)
  updateInfluencer(data: { nombre?: string; apellido?: string; nombreSocial?: string; idsCategorias?: number[]; descripcion?: string; generoAudiencia?: string; esCuentaVerificada?: boolean; fotoPerfil?: File }): Observable<any> {
    const formData = new FormData();
    if (data.nombre) formData.append('Nombre', data.nombre);
    if (data.apellido) formData.append('Apellido', data.apellido);
    if (data.nombreSocial) formData.append('NombreSocial', data.nombreSocial);
    if (data.descripcion != null) formData.append('Descripcion', data.descripcion);
    if (data.generoAudiencia) formData.append('GeneroAudiencia', data.generoAudiencia);
    if (data.esCuentaVerificada != null) formData.append('EsCuentaVerificada', String(data.esCuentaVerificada));
    if (data.idsCategorias) {
      for (const id of data.idsCategorias) {
        formData.append('IdsCategorias', String(id));
      }
    }
    if (data.fotoPerfil) formData.append('FotoPerfil', data.fotoPerfil);
    return this.http.patch(`${this.apiUrl}/ActualizarInfluencer`, formData);
  }

  // Get influencer costs
  obtenerCostos(): Observable<InfluencerCostoResponse[]> {
    return this.http.get<InfluencerCostoResponse[]>(`${this.apiUrl}/ObtenerCostosDeInfluencer`);
  }

  // Add cost per platform
  agregarCosto(costo: InfluencerCosto): Observable<any> {
    return this.http.post(`${this.apiUrl}/AgregarCostoDeInfluncerPorPlataforma`, costo);
  }

  // Update cost per platform
  actualizarCosto(costo: InfluencerCosto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/ActualizarCostoDeInfluncerPorPlataforma`, costo);
  }

  // Delete cost per platform
  eliminarCosto(idPlataforma: number, idTipoContenido: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/EliminarCostoPorPlataforma`, {
      body: { idPlataforma, idTipoContenido }
    });
  }
}
