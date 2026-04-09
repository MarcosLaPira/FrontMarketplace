import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntregaInfluencer } from '../models/types';
import { API_BASE_URL } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class EntregaHistorialService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/entregas`;

  // Trae el historial de una entrega para un entregable y un influencer
  getHistorialEntrega(idEntregable: number, idInfluencer: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial/entregable/${idEntregable}/influencer/${idInfluencer}`);
  }
}
