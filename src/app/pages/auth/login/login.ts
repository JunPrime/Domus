import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  private API_URL = 'https://codigo-production.up.railway.app/Sesion/auth/login';
  
  email: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {}

  async login() {
    // Validaciones
    if (!this.email.trim()) {
      this.error = '⚠ Por favor ingresa tu correo';
      return;
    }
    
    if (!this.password.trim()) {
      this.error = '⚠ Por favor ingresa tu contraseña';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      // Login con OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.set('username', this.email);
      formData.set('password', this.password);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      const result = await response.json();

      if (response.status === 200) {
        console.log('✅ Login exitoso:', result);
        
        // Guardar datos del usuario
        const usuarioData = {
          id: result.id || 1,
          email: this.email,
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          token_type: result.token_type
        };
        
        localStorage.setItem('usuario', JSON.stringify(usuarioData));
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('refresh_token', result.refresh_token);
        
        // Disparar evento para actualizar estado
        const evento = new CustomEvent('authChange', { 
          detail: { isLoggedIn: true } 
        });
        this.document.dispatchEvent(evento);
        
        // Redirigir
        this.router.navigate(['/members']);
      } else {
        this.loading = false;
        
        if (response.status === 401) {
          this.error = '⚠ Correo o contraseña incorrectos';
        } else {
          this.error = result.detail || '⚠ Error al iniciar sesión';
        }
      }
      
    } catch (error: any) {
      this.loading = false;
      console.error('❌ Error:', error);
      this.error = '⚠ Error de conexión. Intenta de nuevo.';
    }
  }
}