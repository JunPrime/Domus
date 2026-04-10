import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
export class MemberComponent implements OnInit {
  miembros: Miembro[] = [];
  loading: boolean = true;
  error: string = '';
  private isBrowser: boolean;
  private API_BASE_URL = 'https://codigo-production.up.railway.app/miembros';
  private HOGARES_API_URL = 'https://codigo-production.up.railway.app/hogares/hogares';
  
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
  idHogarActual: number = 0;
  
  // Bandera para evitar ejecuciones múltiples
  private actualizando: boolean = false;
  private cargandoMiembros: boolean = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.obtenerHogarActual();
    }
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'bearer';
    return {
      'Authorization': `${tokenType} ${token}`,
      'Content-Type': 'application/json',
    };
  }

  obtenerHogarActual() {
    const hogarActual = localStorage.getItem('hogar_actual');
    if (hogarActual) {
      try {
        const hogar = JSON.parse(hogarActual);
        this.idHogarActual = hogar.id_hogar;
        console.log('🏠 Hogar actual:', this.idHogarActual);
        this.cargarMiembros();
      } catch (error) {
        console.error('Error al parsear hogar:', error);
        this.loading = false;
        this.cdr.detectChanges();
        this.error = 'No se pudo obtener el hogar actual';
      }
    } else {
      console.warn('No hay hogar seleccionado');
      this.loading = false;
      this.cdr.detectChanges();
      this.error = 'No hay un hogar seleccionado. Por favor selecciona un hogar primero.';
    }
  }

  async cargarMiembros() {
    // Evitar múltiples cargas simultáneas
    if (this.cargandoMiembros) return;
    this.cargandoMiembros = true;
    
    if (!this.idHogarActual) {
      console.warn('No hay ID de hogar');
      this.loading = false;
      this.cdr.detectChanges();
      this.cargandoMiembros = false;
      return;
    }

    console.log('🔄 Iniciando carga de miembros...');
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();
    
    try {
      const url = `${this.HOGARES_API_URL}/${this.idHogarActual}/miembros`;
      console.log('📡 Fetching miembros from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      console.log('📥 Response status:', response.status);
      
      if (response.status === 401) {
        this.error = 'Sesión expirada. Por favor inicia sesión nuevamente.';
        localStorage.removeItem('access_token');
        localStorage.removeItem('usuario');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
        this.loading = false;
        this.cdr.detectChanges();
        this.cargandoMiembros = false;
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Miembros recibidos (raw):', data);
      
      // Filtrar miembros que no sean válidos o sean datos de prueba
      let miembrosValidos: Miembro[] = [];
      
      if (Array.isArray(data)) {
        miembrosValidos = data.filter(miembro => {
          const nombreValido = miembro.nombre && 
                               miembro.nombre !== 'string' && 
                               miembro.nombre.trim().length > 0 &&
                               !miembro.nombre.includes('{') &&
                               miembro.nombre !== 'null' &&
                               miembro.nombre !== 'undefined';
          
          const idValido = miembro.id_miembro && miembro.id_miembro > 0;
          
          return nombreValido && idValido;
        });
      }
      
      console.log('📊 Miembros después de filtrar:', miembrosValidos);
      
      if (miembrosValidos.length > 0) {
        this.miembros = miembrosValidos;
        console.log('✅ Miembros cargados:', this.miembros.length);
      } else {
        console.log('📭 No hay miembros reales para mostrar');
        this.miembros = [];
      }
    } catch (error: any) {
      console.error('❌ Error cargando miembros:', error);
      this.error = error.message || 'Error al cargar los miembros';
      this.miembros = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
      this.cargandoMiembros = false;
      console.log('🏁 loading =', this.loading, 'miembros =', this.miembros.length);
    }
  }

  verDetalles(miembro: Miembro) {
    this.miembroSeleccionado = miembro;
    this.modalDetallesVisible = true;
  }

  cerrarDetalles() {
    this.modalDetallesVisible = false;
    this.miembroSeleccionado = null;
  }
  cerrarModalEliminar() {
  this.modalEliminarVisible = false;
  this.miembroEditando = {
    id_miembro: 0,
    nombre: '',
    es_admin: false,
    preferencias_alimenticias: null,
    activo: true
  };
  this.error = '';
}
  abrirModalAgregar() {
    this.nuevoMiembro = {
      nombre: '',
      es_admin: false,
      preferencias_alimenticias: null,
      activo: true
    };
    this.modalAgregarVisible = true;
  }

  async agregarMiembro() {
    if (this.actualizando) return;
    this.actualizando = true;
    
    if (!this.nuevoMiembro.nombre.trim()) {
      this.error = 'El nombre es obligatorio';
      this.actualizando = false;
      return;
    }
    
    try {
      const url = `${this.HOGARES_API_URL}/${this.idHogarActual}/miembros`;
      console.log('📡 POST a:', url);
      
      const preferenciasObj = this.nuevoMiembro.preferencias_alimenticias 
        ? { no_puede_comer: [this.nuevoMiembro.preferencias_alimenticias] }
        : null;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          nombre: this.nuevoMiembro.nombre,
          es_admin: this.nuevoMiembro.es_admin,
          preferencias_alimenticias: preferenciasObj ? JSON.stringify(preferenciasObj) : null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear miembro');
      }
      
      const newMember = await response.json();
      console.log('✅ Miembro creado:', newMember);
      
      this.modalAgregarVisible = false;
      await this.cargarMiembros();
    } catch (error: any) {
      console.error('❌ Error:', error);
      this.error = error.message || 'Error al agregar miembro';
    } finally {
      this.actualizando = false;
    }
  }

  abrirModalEditar(miembro: Miembro) {
    this.miembroEditando = { ...miembro };
    this.modalEditarVisible = true;
  }

  async guardarEdicion() {
    if (this.actualizando) return;
    this.actualizando = true;
    
    if (!this.miembroEditando.id_miembro) {
      this.actualizando = false;
      return;
    }
    
    try {
      const url = `${this.API_BASE_URL}/miembros/${this.miembroEditando.id_miembro}`;
      console.log('📡 PUT a:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          nombre: this.miembroEditando.nombre,
          es_admin: this.miembroEditando.es_admin,
          preferencias_alimenticias: this.miembroEditando.preferencias_alimenticias,
          activo: this.miembroEditando.activo
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar miembro');
      }
      
      this.modalEditarVisible = false;
      await this.cargarMiembros();
    } catch (error: any) {
      console.error('❌ Error:', error);
      this.error = error.message || 'Error al actualizar miembro';
    } finally {
      this.actualizando = false;
    }
  }

  async abrirModalConfiguracion(miembro: Miembro) {
    this.idMiembroActual = miembro.id_miembro || 0;
    
    try {
      const url = `${this.API_BASE_URL}/miembros/${this.idMiembroActual}/configuracion`;
      console.log('📡 GET config from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (response.ok) {
        const config = await response.json();
        this.configEditando = {
          crear_actividad: config.crear_actividad,
          crear_tarea: config.crear_tarea,
          administrar_miembros: config.administrar_miembros
        };
      } else {
        this.configEditando = {
          crear_actividad: false,
          crear_tarea: false,
          administrar_miembros: miembro.es_admin
        };
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      this.configEditando = {
        crear_actividad: false,
        crear_tarea: false,
        administrar_miembros: miembro.es_admin
      };
    }
    
    this.modalConfigVisible = true;
  }

  async guardarConfiguracion() {
    if (this.actualizando) return;
    this.actualizando = true;
    
    try {
      const url = `${this.API_BASE_URL}/miembros/${this.idMiembroActual}/configuracion`;
      console.log('📡 PUT config to:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          crear_actividad: this.configEditando.crear_actividad,
          crear_tarea: this.configEditando.crear_tarea,
          administrar_miembros: this.configEditando.administrar_miembros
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar configuración');
      }
      
      this.modalConfigVisible = false;
    } catch (error: any) {
      console.error('❌ Error:', error);
      this.error = error.message || 'Error al guardar configuración';
    } finally {
      this.actualizando = false;
    }
  }

  abrirModalEliminar(miembro: Miembro) {
  this.miembroEditando = { ...miembro };
  this.modalEliminarVisible = true;
  this.error = ''; // Limpiar errores previos
}

  async eliminarMiembro(id: number) {
  if (this.actualizando) return;
  this.actualizando = true;
  
  try {
    // Opción 1: Con doble "miembros"
    const url = `https://codigo-production.up.railway.app/miembros/miembros/${id}`;
    console.log('📡 DELETE a:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    console.log('📥 Response status:', response.status);
    
    if (response.status === 204 || response.status === 200) {
      this.modalEliminarVisible = false;
      this.miembroEditando = {
        id_miembro: 0,
        nombre: '',
        es_admin: false,
        preferencias_alimenticias: null,
        activo: true
      };
      this.cdr.detectChanges();
      await this.cargarMiembros();
      console.log('✅ Miembro eliminado correctamente');
    } else {
      // Si falla, probar la otra opción
      console.log('⚠️ Probando URL alternativa...');
      await this.probarEliminarAlternativo(id);
    }
  } catch (error: any) {
    console.error('❌ Error:', error);
    this.error = error.message || 'Error al eliminar miembro';
  } finally {
    this.actualizando = false;
  }
}

// Método alternativo para probar
async probarEliminarAlternativo(id: number) {
  try {
    // Opción 2: Sin doble "miembros"
    const url = `https://codigo-production.up.railway.app/miembros/${id}`;
    console.log('📡 DELETE alternativo a:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    console.log('📥 Response status alternativo:', response.status);
    
    if (response.status === 204 || response.status === 200) {
      this.modalEliminarVisible = false;
      this.miembroEditando = {
        id_miembro: 0,
        nombre: '',
        es_admin: false,
        preferencias_alimenticias: null,
        activo: true
      };
      this.cdr.detectChanges();
      await this.cargarMiembros();
      console.log('✅ Miembro eliminado correctamente (URL alternativa)');
    } else {
      throw new Error(`Error ${response.status}`);
    }
  } catch (error: any) {
    console.error('❌ Error en URL alternativa:', error);
    this.error = 'No se pudo eliminar el miembro. Verifica la URL del endpoint.';
  }
}

  toggleActivo(miembro: Miembro) {
    if (this.actualizando) return;
    miembro.activo = !miembro.activo;
    this.guardarEdicion();
  }

  navegarAActividades(miembro: Miembro) {
    if (this.isBrowser) {
      sessionStorage.setItem('miembroSeleccionado', JSON.stringify({
        id: miembro.id_miembro,
        nombre: miembro.nombre,
        es_admin: miembro.es_admin
      }));
      
      this.router.navigate(['/actarea']);
    }
  }

  getRolTexto(esAdmin: boolean): string {
    return esAdmin ? 'Administrador' : 'Miembro';
  }
}