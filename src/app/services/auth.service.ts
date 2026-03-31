import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UserProfile, InfluencerRegisterRequest, MarcaRegisterRequest } from '../models/types';
import { API_BASE_URL } from '../shared/constants';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

const CLAIMS = {
  nameId: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  role: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${API_BASE_URL}/auth`;
  private tokenKey = 'jwt_token';

  private token = signal<string | null>(localStorage.getItem('jwt_token'));
  userProfile = signal<UserProfile | null>(null);

  isAuthenticated = computed(() => {
    const t = this.token();
    if (!t) return false;
    try {
      const decoded = jwtDecode<JwtPayload>(t);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  });

  userRole = computed(() => this.userProfile()?.role ?? null);

  constructor() {
    this.loadTokenFromStorage();
  }

  login(request: LoginRequest): Observable<LoginResponse> {

    console.log('Login request:', JSON.stringify(request));
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(

      tap(response => {

        console.log('Login raw response:', JSON.stringify(response));
        const token = response?.token || (response as any).Value;
        if (token) {
          this.setToken(token);
        } else {
          console.error('Token no encontrado en respuesta:', response);
        }
      })
    );
  }




  registerInfluencer(request: InfluencerRegisterRequest): Observable<any> {
    return this.http.post(`${API_BASE_URL}/influencers/crear`, request);
  }

  registerMarca(request: MarcaRegisterRequest): Observable<any> {
    return this.http.post(`${API_BASE_URL}/marca/crear`, request);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.token.set(null);
    this.userProfile.set(null);
  }

  logoutAndRedirect(): void {
    this.logout();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.token();
  }

  getUserId(): string | null {
    const profile = this.userProfile();
    return profile?.id ?? null;
  }

  private setToken(tokenValue: string): void {
    localStorage.setItem(this.tokenKey, tokenValue);
    this.token.set(tokenValue);
    this.updateUserProfile(tokenValue);
  }

  private loadTokenFromStorage(): void {
    const tokenValue = this.token();
    if (tokenValue) {
      try {
        const decoded = jwtDecode<JwtPayload>(tokenValue);
        if (decoded.exp * 1000 > Date.now()) {
          this.updateUserProfile(tokenValue);
        } else {
          this.logout();
        }
      } catch {
        this.logout();
      }
    }
  }

  private updateUserProfile(tokenValue: string): void {
    try {
      const decoded = jwtDecode<JwtPayload>(tokenValue);
      this.userProfile.set({
        id: decoded[CLAIMS.nameId] || '',
        email: decoded[CLAIMS.email] || '',
        nombre: decoded[CLAIMS.name] || '',
        apellido: '',
        role: (decoded[CLAIMS.role] as 'Marca' | 'Influencer' | 'Admin') || 'Influencer'
      });
    } catch {
      this.userProfile.set(null);
    }
  }
}
