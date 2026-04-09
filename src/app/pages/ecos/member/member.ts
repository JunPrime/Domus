import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaz para Miembro
export interface Miembro {
  id_miembro?: number;
  nombre: string;
  es_admin: boolean;
  preferencias_alimenticias: string | null;
  activo: boolean;
  id_hogar?: number;
}

interface ConfiguracionMiembro {
  id_config?: number;
  crear_actividad: boolean;
  crear_tarea: boolean;
  administrar_miembros: boolean;
  id_miembro_f?: number;
}

@Component({
  selector: 'app-member',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member.html',
  styleUrls: ['./member.css']
})
export class MemberComponent {
  // Lista de miembros (vacía al inicio)
  miembros: Miembro[] = [];

  // Variables para modales
  modalEditarVisible = false;
  modalConfigVisible = false;
  modalEliminarVisible = false;
  modalAgregarVisible = false;
  modalDetallesVisible = false;
  
  // Variables para formularios
  miembroEditando: Miembro = {
    id_miembro: 0,
    nombre: '',
    es_admin: false,
    preferencias_alimenticias: null,
    activo: true
  };
  
  nuevoMiembro: Miembro = {
    nombre: '',
    es_admin: false,
    preferencias_alimenticias: null,
    activo: true
  };
  
  configEditando: ConfiguracionMiembro = {
    crear_actividad: false,
    crear_tarea: false,
    administrar_miembros: false
  };
  
  miembroSeleccionado: Miembro | null = null;
  idMiembroActual = 0;

  // Ver detalles
  verDetalles(miembro: Miembro) {
    this.miembroSeleccionado = miembro;
    this.modalDetallesVisible = true;
  }

  cerrarDetalles() {
    this.modalDetallesVisible = false;
    this.miembroSeleccionado = null;
  }

  // Agregar miembro
  abrirModalAgregar() {
    this.nuevoMiembro = {
      nombre: '',
      es_admin: false,
      preferencias_alimenticias: null,
      activo: true
    };
    this.modalAgregarVisible = true;
  }

  agregarMiembro() {
    if (!this.nuevoMiembro.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    
    const nuevoId = this.miembros.length > 0 
      ? Math.max(...this.miembros.map(m => m.id_miembro || 0)) + 1 
      : 1;
    
    this.miembros.push({
      id_miembro: nuevoId,
      nombre: this.nuevoMiembro.nombre,
      es_admin: this.nuevoMiembro.es_admin,
      preferencias_alimenticias: this.nuevoMiembro.preferencias_alimenticias,
      activo: this.nuevoMiembro.activo,
      id_hogar: 1
    });
    
    this.modalAgregarVisible = false;
    alert('Miembro agregado');
  }

  // Editar miembro
  abrirModalEditar(miembro: Miembro) {
    this.miembroEditando = { ...miembro };
    this.modalEditarVisible = true;
  }

  guardarEdicion() {
    const index = this.miembros.findIndex(m => m.id_miembro === this.miembroEditando.id_miembro);
    if (index !== -1) {
      this.miembros[index] = { ...this.miembroEditando };
    }
    this.modalEditarVisible = false;
    alert('Miembro actualizado');
  }

  // Configuración de permisos
  abrirModalConfiguracion(miembro: Miembro) {
    this.idMiembroActual = miembro.id_miembro || 0;
    this.configEditando = {
      crear_actividad: false,
      crear_tarea: false,
      administrar_miembros: miembro.es_admin
    };
    this.modalConfigVisible = true;
  }

  guardarConfiguracion() {
    this.modalConfigVisible = false;
    alert('Configuración guardada');
  }

  // Eliminar miembro
  abrirModalEliminar(miembro: Miembro) {
    this.miembroEditando = miembro;
    this.modalEliminarVisible = true;
  }

  eliminarMiembro(id: number) {
    this.miembros = this.miembros.filter(m => m.id_miembro !== id);
    this.modalEliminarVisible = false;
    alert('Miembro eliminado');
  }

  // Cambiar estado activo/inactivo
  toggleActivo(miembro: Miembro) {
    miembro.activo = !miembro.activo;
  }

  // Métodos auxiliares
  getRolTexto(esAdmin: boolean): string {
    return esAdmin ? 'Administrador' : 'Miembro';
  }
}