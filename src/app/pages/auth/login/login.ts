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
  // URL directa - SIN PROXY
  private API_URL = 'https://codigo-production.up.railway.app/Sesion/auth/login';
  private API_ME_URL = 'https://codigo-production.up.railway.app/Sesion/auth/me';
  
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
      // Paso 1: Login
      const formData = new URLSearchParams();
      formData.set('username', this.email);
      formData.set('password', this.password);

      console.log('📡 Enviando login a:', this.API_URL);

      const loginResponse = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      const loginResult = await loginResponse.json();

      if (loginResponse.status === 200) {
        console.log('✅ Login exitoso:', loginResult);
        
        const accessToken = loginResult.access_token;
        const tokenType = loginResult.token_type || 'bearer';
        
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', loginResult.refresh_token);
        localStorage.setItem('token_type', tokenType);

        // Paso 2: Obtener /me
        console.log('📡 Obteniendo datos de /me');

        const meResponse = await fetch(this.API_ME_URL, {
          method: 'GET',
          headers: {
            'Authorization': `${tokenType} ${accessToken}`,
            'Content-Type': 'application/json',
          }
        });

        if (meResponse.status === 200) {
          const userData = await meResponse.json();
          console.log('✅ Datos del usuario:', userData);
          
          const usuarioData = {
            id: userData.id_usuario,
            nombre: userData.nombre,
            correo: userData.correo,
            email: userData.correo,
            fecha_registro: userData.fecha_registro,
            access_token: accessToken,
            refresh_token: loginResult.refresh_token,
            token_type: tokenType
          };
          
          localStorage.setItem('usuario', JSON.stringify(usuarioData));
          
          const evento = new CustomEvent('authChange', { 
            detail: { isLoggedIn: true, user: usuarioData } 
          });
          this.document.dispatchEvent(evento);
          
          this.router.navigate(['/members']);
        } else {
          const errorData = await meResponse.json();
          this.loading = false;
          this.error = errorData.detail || '⚠ Error al obtener datos del usuario';
        }
      } else {
        this.loading = false;
        
        if (loginResponse.status === 401) {
          this.error = '⚠ Correo o contraseña incorrectos';
        } else {
          this.error = loginResult.detail || '⚠ Error al iniciar sesión';
        }
      }
      
    } catch (error: any) {
      this.loading = false;
      console.error('❌ Error:', error);
      this.error = '⚠ Error de conexión. Intenta de nuevo.';
    }
  }
}