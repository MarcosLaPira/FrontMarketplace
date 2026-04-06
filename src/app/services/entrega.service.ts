import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntregaInfluencer, EnviarEntregaRequest } from '../models/types';
import { API_BASE_URL } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class EntregaService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/entregas`;

  // Influencer envía un entregable (URL + comentario opcional)
  enviarEntrega(request: EnviarEntregaRequest): Observable<EntregaInfluencer> {
    return this.http.post<EntregaInfluencer>(`${this.apiUrl}/enviar`, request);
  }

  // Influencer ve sus propias entregas en una campaña
  getMisEntregasPorCampana(idCampana: number): Observable<EntregaInfluencer[]> {
    return this.http.get<EntregaInfluencer[]>(`${this.apiUrl}/mis-entregas/campana/${idCampana}`);
  }
}
