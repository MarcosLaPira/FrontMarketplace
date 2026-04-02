import { Component, OnInit, signal, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { PostulacionService } from '../../../services/postulacion.service';
import { CampanaService } from '../../../services/campana.service';
import { CatalogService } from '../../../services/catalog.service';
import { Campana, Postulacion } from '../../../models/types';
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
  private postulacionService = inject(PostulacionService);
  private campanaService = inject(CampanaService);
  private catalogService = inject(CatalogService);

  userProfile = this.authService.userProfile;
  categorias = this.catalogService.categorias;

  activeTab = signal<'perfil' | 'estadisticas' | 'costos' | 'campanas' | 'postulaciones'>('perfil');
  campanas = signal<Campana[]>([]);
  misPostulaciones = signal<Postulacion[]>([]);

  ngOnInit(): void {
    this.loadCampanas();
    this.loadMisPostulaciones();
  }

  loadCampanas(): void {
    this.campanaService.getCampanas().subscribe({
      next: (data: Campana[]) => this.campanas.set(data),
      error: (err: any) => console.error('Error loading campaigns:', err)
    });
  }

  loadMisPostulaciones(): void {
    this.postulacionService.getMisPostulaciones().subscribe({
      next: (data: Postulacion[]) => this.misPostulaciones.set(data),
      error: (err: any) => console.error('Error loading postulations:', err)
    });
  }

  onPostulacionEnviada(): void {
    this.loadMisPostulaciones();
  }

  logout(): void {
    this.authService.logoutAndRedirect();
  }
}
