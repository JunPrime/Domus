import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class header {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() titulo: string = 'Mi App';
  @Input() usuarioNombre: string = 'Usuario';

  isLoggedIn: boolean = true;

  onToggleSidebar() {
    console.log('Header button clicked'); // Debug
    this.toggleSidebar.emit();
  }

  mostrarPerfil() {
    console.log('Mostrar perfil');
  }

  mostrarConfiguracion() {
    console.log('Mostrar configuración');
  }

  login() {
    this.isLoggedIn = true;
    console.log('Usuario inició sesión');
  }

  logout() {
    this.isLoggedIn = false;
    console.log('Usuario cerró sesión');
  }
}