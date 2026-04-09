import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importa Router

interface Hogar {
  id: number;
  titulo: string;
  color: string;
  textColor: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class home {
  hogares: Hogar[] = [];
  nextId: number = 1;

  mostrarModal = false;
  nuevoTitulo = '';
  nuevoColor = '#B8E0D2';

  coloresPastel = [
    '#B8E0D2', '#FFD6B5', '#FFB5C2', '#C9E4DE',
    '#E8D1C5', '#D4E0F0', '#FCE1B3', '#E0D4E8'
  ];

  textColors: { [key: string]: string } = {
    '#B8E0D2': '#2c5f4e',
    '#FFD6B5': '#8b5a2b',
    '#FFB5C2': '#8b3a4a',
    '#C9E4DE': '#2c5f4e',
    '#E8D1C5': '#6b3e2a',
    '#D4E0F0': '#2c3e6b',
    '#FCE1B3': '#8b6b2a',
    '#E0D4E8': '#4a2a6b'
  };

  constructor(private router: Router) {} // Inyecta Router

  abrirModal() {
    this.mostrarModal = true;
    this.nuevoTitulo = '';
    this.nuevoColor = this.coloresPastel[0];
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarHogar() {
    if (!this.nuevoTitulo.trim()) {
      alert('Debes ingresar un nombre para el hogar');
      return;
    }

    const nuevoHogar: Hogar = {
      id: this.nextId,
      titulo: this.nuevoTitulo.trim(),
      color: this.nuevoColor,
      textColor: this.textColors[this.nuevoColor] || '#333'
    };

    this.hogares.push(nuevoHogar);
    this.nextId++;
    this.cerrarModal();
  }

  editarHogar(hogar: Hogar) {
    const nuevoTitulo = prompt('Editar nombre del hogar:', hogar.titulo);
    if (nuevoTitulo && nuevoTitulo.trim()) {
      hogar.titulo = nuevoTitulo.trim();
    }
  }

  eliminarHogar(hogar: Hogar) {
    const confirmacion = confirm(`¿Seguro que deseas eliminar el hogar "${hogar.titulo}"?`);
    if (confirmacion) {
      this.hogares = this.hogares.filter(h => h.id !== hogar.id);
    }
  }

  entrarHogar(hogar: Hogar) {
  console.log(`Entrando al hogar: ${hogar.titulo}`);
  
  // Opción 1: Usar navigateByUrl
  this.router.navigateByUrl('/member');
  
  // Opción 2: Usar window.location (para probar)
  // window.location.href = '/member';
}

  trackById(index: number, item: Hogar): number {
    return item.id;
  }
}