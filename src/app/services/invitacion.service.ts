import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvitacionInfluencer } from '../models/types';
import { API_BASE_URL } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class InvitacionService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/invitaciones`;

  getMisInvitaciones(): Observable<InvitacionInfluencer[]> {
    return this.http.get<InvitacionInfluencer[]>(`${this.apiUrl}/mis-invitaciones`);
  }

  responderInvitacion(id: number, idEstado: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cambiar-estado/${id}`, { idEstadoInvitacionCampana: idEstado });
  }
}
