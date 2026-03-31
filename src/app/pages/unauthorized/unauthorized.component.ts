import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-red-600 mb-4">403</h1>
        <h2 class="text-3xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
        <p class="text-gray-600 mb-8">No tienes permiso para acceder a esta página.</p>
        <a routerLink="/explore" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Volver a explorar
        </a>
      </div>
    </div>
  `
})
export class UnauthorizedComponent { }
