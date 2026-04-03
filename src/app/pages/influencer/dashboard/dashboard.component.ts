import { Component, OnInit, signal, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CampanaService } from '../../../services/campana.service';
import { CatalogService } from '../../../services/catalog.service';
import { Campana } from '../../../models/types';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { InfluencerPerfilComponent } from './components/influencer-perfil/influencer-perfil.component';
import { InfluencerEstadisticasComponent } from './components/influencer-estadisticas/influencer-estadisticas.component';
import { InfluencerCostosComponent } from './components/influencer-costos/influencer-costos.component';
import { InfluencerCampanasComponent } from './components/influencer-campanas/influencer-campanas.component';
import { InfluencerPostulacionesComponent } from './components/influencer-postulaciones/influencer-postulaciones.component';
import { InfluencerSocialConnectComponent } from '../../../components/influencer-social-connect/influencer-social-connect.component';

@Component({
  selector: 'app-influencer-dashboard',
  standalone: true,
  imports: [
    NavbarComponent,
    InfluencerPerfilComponent,
    InfluencerEstadisticasComponent,
    InfluencerCostosComponent,
    InfluencerCampanasComponent,
    InfluencerPostulacionesComponent,
    InfluencerSocialConnectComponent
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private campanaService = inject(CampanaService);
  private catalogService = inject(CatalogService);

  userProfile = this.authService.userProfile;
  categorias = this.catalogService.categorias;

  activeTab = signal<'perfil' | 'estadisticas' | 'costos' | 'campanas' | 'postulaciones'>('perfil');
  campanas = signal<Campana[]>([]);

  tabs = [
    { id: 'perfil' as const, label: 'Perfil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'estadisticas' as const, label: 'Estadísticas', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'costos' as const, label: 'Costos', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'campanas' as const, label: 'Campañas', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
    { id: 'postulaciones' as const, label: 'Postulaciones', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
  ];

  ngOnInit(): void {
    this.loadCampanas();
  }

  loadCampanas(): void {
    this.campanaService.getCampanas().subscribe({
      next: (data: Campana[]) => this.campanas.set(data),
      error: (err: any) => console.error('Error loading campaigns:', err)
    });
  }

  logout(): void {
    this.authService.logoutAndRedirect();
  }
}
