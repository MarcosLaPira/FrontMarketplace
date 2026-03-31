import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Postulacion, PostulacionCreateRequest } from '../models/types';
import { API_BASE_URL } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class PostulacionService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/postulaciones`;

  // Create new postulation
  postular(request: PostulacionCreateRequest): Observable<Postulacion> {
    return this.http.post<Postulacion>(`${this.apiUrl}/postular`, request);
  }

  // Get postulations by campaign
  getPostulacionesPorCampana(idCampana: number): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.apiUrl}/por-campana/${idCampana}`);
  }

  // Get postulations by influencer
  getPostulacionesPorInfluencer(idInfluencer: number): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.apiUrl}/por-influencer/${idInfluencer}`);
  }

  // Change postulation status
  cambiarEstado(id: number, nuevoEstado: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cambiar-estado/${id}`, { nuevoEstado });
  }

  // Get my postulations
  getMisPostulaciones(): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.apiUrl}/mis-postulaciones`);
  }
}
