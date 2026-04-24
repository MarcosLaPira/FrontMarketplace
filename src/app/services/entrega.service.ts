import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntregaInfluencer, EnviarEntregaRequest } from '../models/types';
import { API_BASE_URL } from '../shared/constants';

export interface RevisarEntregaPayload {
  aprobada: boolean;
  comentario: string;
}

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

  enviarEntregaFormData(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar`, formData);
  }

  // Marca obtiene todas las entregas de una campaña
  getEntregasPorCampana(idCampana: number): Observable<EntregaInfluencer[]> {
    return this.http.get<EntregaInfluencer[]>(`${this.apiUrl}/por-campana/${idCampana}`);
  }

  // Marca revisa una entrega (aprobar o devolver)
  revisarEntrega(idEntregaInfluencer: number, payload: RevisarEntregaPayload): Observable<EntregaInfluencer> {
    return this.http.patch<EntregaInfluencer>(`${this.apiUrl}/revisar/${idEntregaInfluencer}`, payload);
  }
}
