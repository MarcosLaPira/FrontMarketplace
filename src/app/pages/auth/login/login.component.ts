import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');

  loginForm = this.fb.nonNullable.group({

    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]

  });

  onSubmit(): void {

    console.log('Login form submitted:', this.loginForm.value);
    if (this.loginForm.invalid) {
      this.error.set('Por favor completa todos los campos correctamente');
      return;
    }
    console.log('Form is valid, proceeding with login...');

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.loginForm.getRawValue()).subscribe({


      next: () => {

        console.log('Login successful, navigating to dashboard...');
        this.loading.set(false);

        const role = this.authService.userRole();
        console.log('User role after login:', role);

        if (role === 'Influencer') {
          this.router.navigate(['/dashboard-influencer']);
        } else if (role === 'Marca') {
          this.router.navigate(['/dashboard-marca']);
        } else {
         // this.router.navigate(['/explore']);
        }

      },
      error: (err: any) => {
        console.error('Login error:', err);
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error en el login. Verifica tus credenciales.');
      }
    });
  }
}
