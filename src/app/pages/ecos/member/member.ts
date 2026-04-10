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
  ver_gastos?: boolean;
  crear_gastos?: boolean;
}

export interface Gasto {
  id_gasto?: number;
  titulo: string;
  descripcion: string;
  valor_aproximado: number;
  fecha?: string;
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
  success: string = ''; // ✅ Agregar propiedad success
  private isBrowser: boolean;
  private API_BASE_URL = 'https://codigo-production.up.railway.app/miembros';
  private HOGARES_API_URL = 'https://codigo-production.up.railway.app/hogares/hogares';
  private GASTOS_API_URL = 'https://codigo-production.up.railway.app/gastos';
  
  // Variables para modales
  modalEditarVisible = false;
  modalConfigVisible = false;
  modalEliminarVisible = false;
  modalAgregarVisible = false;
  modalDetallesVisible = false;
  modalGastosVisible = false;
  
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
    administrar_miembros: false,
    ver_gastos: true,
    crear_gastos: false
  };
  
  miembroSeleccionado: Miembro | null = null;
  idMiembroActual = 0;
  idHogarActual: number = 0;
  
  // Variables para gastos
  gastosMiembro: Gasto[] = [];
  loadingGastos: boolean = false;
  nuevoGasto: Gasto = {
    titulo: '',
    descripcion: '',
    valor_aproximado: 0
  };
  mostrarFormularioGasto: boolean = false;
  
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

  private getAuthHeaders(): Record<string, string> {
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

  // ==================== GASTOS DEL MIEMBRO ====================
  async abrirModalGastos(miembro: Miembro) {
    this.miembroSeleccionado = miembro;
    this.idMiembroActual = miembro.id_miembro || 0;
    this.modalGastosVisible = true;
    this.gastosMiembro = [];
    this.nuevoGasto = { titulo: '', descripcion: '', valor_aproximado: 0 };
    this.mostrarFormularioGasto = false;
    await this.cargarGastosMiembro();
  }

  async cargarGastosMiembro() {
    if (!this.idMiembroActual) return;
    
    this.loadingGastos = true;
    
    try {
      const url = `${this.GASTOS_API_URL}/gastos/miembros/${this.idMiembroActual}/gastos`;
      console.log('📡 GET gastos desde:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (response.status === 401) {
        this.error = 'Sesión expirada';
        return;
      }
      
      if (response.status === 404) {
        this.gastosMiembro = [];
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        this.gastosMiembro = data;
      } else if (data && data.gastos) {
        this.gastosMiembro = data.gastos;
      } else {
        this.gastosMiembro = [];
      }
      
      console.log('📊 Gastos cargados:', this.gastosMiembro.length);
      
    } catch (error: any) {
      console.error('❌ Error cargando gastos:', error);
      this.gastosMiembro = [];
    } finally {
      this.loadingGastos = false;
      this.cdr.detectChanges();
    }
  }

  async registrarGasto() {
    // Validaciones
    if (!this.nuevoGasto.titulo || this.nuevoGasto.titulo.trim() === '') {
      this.error = 'El título del gasto es obligatorio';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    if (!this.nuevoGasto.valor_aproximado || this.nuevoGasto.valor_aproximado <= 0) {
      this.error = 'El valor del gasto debe ser mayor a 0';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    this.loadingGastos = true;

    try {
      const url = `${this.GASTOS_API_URL}/gastos/miembros/${this.idMiembroActual}/gastos`;
      
      const valorNumerico = Number(this.nuevoGasto.valor_aproximado);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        this.error = 'El valor debe ser un número válido';
        return;
      }
      
      const body = {
        titulo: this.nuevoGasto.titulo.trim().substring(0, 50),
        descripcion: this.nuevoGasto.descripcion?.trim().substring(0, 250) || '',
        valor_aproximado: valorNumerico
      };
      
      console.log('📡 POST a:', url);
      console.log('📦 Body enviado:', JSON.stringify(body, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body)
      });
      
      console.log('📥 Response status:', response.status);
      
      if (response.status === 401) {
        this.error = 'Sesión expirada. Por favor inicia sesión nuevamente.';
        localStorage.removeItem('access_token');
        localStorage.removeItem('usuario');
        setTimeout(() => this.router.navigate(['/login']), 2000);
        return;
      }
      
      if (response.status === 403) {
        this.error = 'No tienes permiso para registrar gastos para este miembro';
        return;
      }
      
      if (response.status === 404) {
        this.error = 'El miembro no existe';
        return;
      }
      
      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Error ${response.status}: ${responseText}`);
      }
      
      const result = await response.json();
      console.log('✅ Gasto registrado:', result);
      
      this.nuevoGasto = { titulo: '', descripcion: '', valor_aproximado: 0 };
      this.mostrarFormularioGasto = false;
      await this.cargarGastosMiembro();
      this.error = '';
      this.success = 'Gasto registrado exitosamente';
      setTimeout(() => this.success = '', 3000);
      
    } catch (error: any) {
      console.error('❌ Error:', error);
      this.error = error.message || 'Error al registrar el gasto';
    } finally {
      this.loadingGastos = false;
      this.cdr.detectChanges();
    }
  }

  async eliminarGasto(idGasto: number) {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
    
    try {
      const url = `${this.GASTOS_API_URL}/gastos/${idGasto}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (response.ok) {
        await this.cargarGastosMiembro();
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      this.error = error.message || 'Error al eliminar el gasto';
    }
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  cerrarModalGastos() {
    this.modalGastosVisible = false;
    this.miembroSeleccionado = null;
    this.gastosMiembro = [];
  }

  // ==================== CRUD MIEMBROS ====================
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
          administrar_miembros: config.administrar_miembros,
          ver_gastos: true,
          crear_gastos: config.crear_gastos || false
        };
      } else {
        this.configEditando = {
          crear_actividad: false,
          crear_tarea: false,
          administrar_miembros: miembro.es_admin,
          ver_gastos: true,
          crear_gastos: false
        };
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      this.configEditando = {
        crear_actividad: false,
        crear_tarea: false,
        administrar_miembros: miembro.es_admin,
        ver_gastos: true,
        crear_gastos: false
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
          administrar_miembros: this.configEditando.administrar_miembros,
          crear_gastos: this.configEditando.crear_gastos
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
    this.error = '';
  }

  async eliminarMiembro(id: number) {
    if (this.actualizando) return;
    this.actualizando = true;
    
    try {
      const url = `${this.API_BASE_URL}/miembros/${id}`;
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
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      this.error = error.message || 'Error al eliminar miembro';
    } finally {
      this.actualizando = false;
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