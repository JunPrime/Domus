import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router,} from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-regis',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './regis.html',
  styleUrls: ['./regis.css']
})
export class Regis {
  private API_URL = '/Sesion/auth/register';
  
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  error: string = '';
  loading: boolean = false;

  constructor(private router: Router) {}

  async register() {
    // Validaciones
    if (!this.username.trim()) {
      this.error = '⚠ Por favor ingresa tu usuario';
      return;
    }
    
    if (!this.email.trim()) {
      this.error = '⚠ Por favor ingresa tu correo';
      return;
    }
    
    if (!this.email.includes('@')) {
      this.error = '⚠ Ingresa un correo válido';
      return;
    }
    
    if (!this.password.trim()) {
      this.error = '⚠ Por favor ingresa tu contraseña';
      return;
    }
    
    if (this.password.length < 6) {
      this.error = '⚠ La contraseña debe tener al menos 6 caracteres';
      return;
    }
    
    if (this.password !== this.confirmPassword) {
      this.error = '⚠ Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombre: this.username,
          correo: this.email, 
          contraseña: this.password
        })
      });

      const result = await response.json();

      if (response.status === 201) {
        console.log('✅ Registro exitoso:', result);
        // Redirigir al login después de registrar
        this.router.navigate(['/Login']);
      } else if (response.status === 400) {
        if (result.detail && result.detail.includes('correo')) {
          this.error = '⚠ El correo ya está registrado';
        } else {
          this.error = result.detail || '⚠ Error en el registro';
        }
      } else {
        this.error = result.detail || '⚠ Error al registrarse';
      }
      
    } catch (error: any) {
      console.error('❌ Error:', error);
      this.error = '⚠ Error de conexión. Intenta de nuevo.';
    } finally {
      this.loading = false;
    }
  }
}