import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CatalogService } from './services/catalog.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Marketplace.Frontend';
  private catalogService = inject(CatalogService);

  constructor() {
    this.catalogService.loadCatalogs();
  }
}
