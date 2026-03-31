import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  private authService = inject(AuthService);

  displayName = input<string | undefined>();
  showExploreLink = input(false);
  showAuthLinks = input(false);

  isAuthenticated = this.authService.isAuthenticated;
  userRole = this.authService.userRole;

  logout(): void {
    this.authService.logoutAndRedirect();
  }
}
