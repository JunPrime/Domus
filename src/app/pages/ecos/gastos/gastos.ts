import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Gasto {
  id_gasto?: number;
  titulo: string;
  descripcion: string;
  valor_aproximado: number;
  fecha?: string;
}

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gastos.html',
  styleUrls: ['./gastos.css']
})
export class Gastos implements OnInit {
  // Variables
  idMiembro: number = 0;
  
  // Datos
  gastos: Gasto[] = [];
  
  // Estados de UI
  loading: boolean = false;
  error: string = '';
  success: string = '';

  ngOnInit() {
    this.cargarIdMiembro();
  }

  private cargarIdMiembro() {
    const miembroGuardado = sessionStorage.getItem('miembroSeleccionado');
    if (miembroGuardado) {
      try {
        const miembro = JSON.parse(miembroGuardado);
        this.idMiembro = miembro.id;
        console.log('👤 Miembro ID cargado:', this.idMiembro);
        this.listarGastosMiembro();
      } catch (error) {
        console.error('Error al parsear miembro:', error);
        this.error = 'No se pudo obtener el miembro seleccionado';
      }
    } else {
      this.error = 'No hay un miembro seleccionado';
    }
  }

  // ==================== LISTAR GASTOS ====================
  listarGastosMiembro() {
    if (!this.idMiembro) {
      this.error = 'No hay ID de miembro disponible';
      return;
    }

    this.loading = true;
    this.error = '';
    this.gastos = [];

    // Tu compañero agrega la API aquí
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  // ==================== RECARGAR ====================
  recargarGastos() {
    this.listarGastosMiembro();
  }

  // ==================== AUXILIARES ====================
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  cerrarMensajes() {
    setTimeout(() => {
      this.error = '';
      this.success = '';
    }, 3000);
  }
}