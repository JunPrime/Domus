import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from "@angular/router"; // Importa RouterLink también

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // Agrega RouterLink aquí
  templateUrl: './side-bar.html',
  styleUrls: ['./side-bar.css']
})
export class SideBar {
  abierto: boolean = false;
  
  @Output() estadoCambiado = new EventEmitter<boolean>();

  toggle() {
    this.abierto = !this.abierto;
    this.estadoCambiado.emit(this.abierto);
    console.log('Sidebar toggled, estado:', this.abierto);
  }

  logout() {
    console.log('Cerrando sesión...');
    localStorage.removeItem('token');
    // Aquí puedes redirigir al login
    // this.router.navigate(['/login']);
    this.toggle();
  }
}