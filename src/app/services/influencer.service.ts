import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Influencer,
  InfluencerDetalle,
  InfluencerCosto,
  InfluencerCostoResponse,
  InfluencerEstadistica,
  InfluencerFilter
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
  getInfluencers(filters?: InfluencerFilter): Observable<Influencer[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.idsCategorias?.length) {
        for (const id of filters.idsCategorias) {
          params = params.append('idsCategorias', id.toString());
        }
      }
      if (filters.plataformaId) params = params.set('plataformaId', filters.plataformaId.toString());
      if (filters.seguidoresMin != null) params = params.set('seguidoresMin', filters.seguidoresMin.toString());
      if (filters.seguidoresMax != null) params = params.set('seguidoresMax', filters.seguidoresMax.toString());
      if (filters.costoMin != null) params = params.set('costoMin', filters.costoMin.toString());
      if (filters.costoMax != null) params = params.set('costoMax', filters.costoMax.toString());
      if (filters.soloCanje != null) params = params.set('soloCanje', filters.soloCanje.toString());
      if (filters.soloVerificados != null) params = params.set('soloVerificados', filters.soloVerificados.toString());
      if (filters.generoAudiencia) params = params.set('generoAudiencia', filters.generoAudiencia);
      if (filters.ratingMin != null) params = params.set('ratingMin', filters.ratingMin.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    }
    return this.http.get<Influencer[]>(`${this.apiUrl}/ObtenerInfluencers`, { params });
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
