import { Component, OnInit, signal, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { MarcaService } from '../../../services/marca.service';
import { CampanaService } from '../../../services/campana.service';
import { CatalogService } from '../../../services/catalog.service';
import { Marca, Campana } from '../../../models/types';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { MarcaProfileComponent } from './components/marca-profile/marca-profile.component';
import { MarcaCampanasComponent } from './components/marca-campanas/marca-campanas.component';
import { MarcaInfluencersComponent } from './components/marca-influencers/marca-influencers.component';

@Component({
  selector: 'app-marca-dashboard',
  standalone: true,
  imports: [NavbarComponent, MarcaProfileComponent, MarcaCampanasComponent, MarcaInfluencersComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private marcaService = inject(MarcaService);
  private campanaService = inject(CampanaService);
  private catalogService = inject(CatalogService);

  userProfile = this.authService.userProfile;
  plataformas = this.catalogService.plataformas;
  categorias = this.catalogService.categorias;

  activeTab = signal<'campanas' | 'mi-marca' | 'influencers'>('campanas');
  marca = signal<Marca | null>(null);
  misCampanas = signal<Campana[]>([]);

  ngOnInit(): void {
    this.loadMarcaData();
    this.loadMisCampanas();
    window.addEventListener('reload-campanas', () => this.loadMisCampanas());
  }

  onTabChange(tab: 'campanas' | 'mi-marca' | 'influencers'): void {
    this.activeTab.set(tab);
  }

  loadMarcaData(): void {
    this.marcaService.getMyMarca().subscribe({
      next: (data: Marca) => this.marca.set(data),
      error: (err: any) => console.error('Error loading marca:', err)
    });
  }

  loadMisCampanas(): void {
    this.campanaService.getMisCampanas().subscribe({
      next: (data: Campana[]) => this.misCampanas.set(data),
      error: (err: any) => console.error('Error loading campaigns:', err)
    });
  }

  logout(): void {
    this.authService.logoutAndRedirect();
  }
}
