import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface Evento {
  id: number;
  nombre: string;
  tipo: 'actividad' | 'tarea';
  descripcion?: string;
  fechaHora?: Date;
  fecha?: Date;
  completada: boolean;
  completadaEn?: Date;
  id_miembro_f?: number;
  duracion_minutos?: number;
}

export interface DiaCalendario {
  date: Date | null;
  eventos: Evento[];
}

@Component({
  selector: 'app-actarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './actarea.html',
  styleUrls: ['./actarea.css']
})
export class Actarea implements OnInit {
  // Propiedades del calendario
  monthYearDisplay: string = '';
  weekDays: string[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  daysInCalendar: DiaCalendario[] = [];
  currentDate: Date = new Date();
  
  // Propiedades de formularios
  nuevaActividadNombre: string = '';
  nuevaActividadDescripcion: string = '';
  nuevaActividadFechaHora: string = '';
  
  nuevaTareaNombre: string = '';
  nuevaTareaDescripcion: string = '';
  nuevaTareaFecha: string = '';
  nuevaTareaHora: string = '';
  nuevaTareaDuracion: number = 30;
  
  // Listas principales
  actividades: Evento[] = [];
  tareas: Evento[] = [];
  
  // Filtros
  filtroActividades: 'todas' | 'pendientes' | 'completadas' = 'pendientes';
  filtroTareas: 'todas' | 'pendientes' | 'completadas' = 'pendientes';

  // Control del calendario visible/colapsado
  calendarioVisible: boolean = true;

  // Variables de estado
  loading: boolean = true;
  error: string = '';
  private isBrowser: boolean;
  private actualizando: boolean = false;
  
  // IDs
  private idMiembroActual: number = 0;
  private idHogarActual: number = 0;
  private miembroNombre: string = '';

  // URLs de API
  private API_ACTIVIDADES_URL = 'https://codigo-production.up.railway.app/actividades';
  private API_TAREAS_URL = 'https://codigo-production.up.railway.app/tareas';
  private API_HOGARES_URL = 'https://codigo-production.up.railway.app/hogares/hogares';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.obtenerMiembroSeleccionado();
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

  obtenerMiembroSeleccionado() {
    const miembroGuardado = sessionStorage.getItem('miembroSeleccionado');
    if (miembroGuardado) {
      try {
        const miembro = JSON.parse(miembroGuardado);
        this.idMiembroActual = miembro.id;
        this.miembroNombre = miembro.nombre;
        console.log('👤 Miembro seleccionado:', this.miembroNombre, 'ID:', this.idMiembroActual);
        
        // Obtener también el hogar actual
        this.obtenerHogarActual();
      } catch (error) {
        console.error('Error al parsear miembro:', error);
        this.error = 'No se pudo obtener el miembro seleccionado';
        this.loading = false;
      }
    } else {
      console.warn('No hay miembro seleccionado');
      this.error = 'No hay un miembro seleccionado. Por favor selecciona un miembro primero.';
      this.loading = false;
    }
  }

  obtenerHogarActual() {
    const hogarActual = localStorage.getItem('hogar_actual');
    if (hogarActual) {
      try {
        const hogar = JSON.parse(hogarActual);
        this.idHogarActual = hogar.id_hogar;
        console.log('🏠 Hogar actual:', this.idHogarActual);
        this.cargarDatos();
      } catch (error) {
        console.error('Error al parsear hogar:', error);
        this.error = 'No se pudo obtener el hogar actual';
        this.loading = false;
      }
    } else {
      console.warn('No hay hogar seleccionado');
      this.error = 'No hay un hogar seleccionado';
      this.loading = false;
    }
  }

  async cargarDatos() {
    await Promise.all([
      this.cargarActividades(),
      this.cargarTareas()
    ]);
    this.inicializarCalendario();
    this.loading = false;
    this.cdr.detectChanges();
  }

  // ==================== API ACTIVIDADES ====================
  
  async cargarActividades() {
    try {
      const url = `${this.API_ACTIVIDADES_URL}/miembros/${this.idMiembroActual}/actividades`;
      console.log('📡 Fetching actividades from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (response.status === 401) {
        this.redirigirLogin();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Actividades recibidas:', data);
      
      this.actividades = data.map((act: any) => ({
        id: act.id_actividad,
        nombre: `Actividad ${act.id_actividad}`,
        tipo: 'actividad',
        fechaHora: act.hora ? new Date(`2000-01-01T${act.hora}`) : undefined,
        completada: false,
        descripcion: `Días: ${act.dias_semana}, Duración: ${act.duracion_minutos}min`,
        duracion_minutos: act.duracion_minutos
      }));
      
    } catch (error: any) {
      console.error('❌ Error cargando actividades:', error);
      this.actividades = [];
    }
  }

  async crearActividadAPI(): Promise<boolean> {
    try {
      const fechaHora = new Date(this.nuevaActividadFechaHora);
      const hora = fechaHora.toTimeString().split(' ')[0];
      const fecha = fechaHora.toISOString().split('T')[0];
      
      const body = {
        repetitiva_semanal: false,
        hora: hora,
        dias_semana: null,
        duracion_minutos: 60,
        economica: false
      };
      
      const url = `${this.API_ACTIVIDADES_URL}/miembros/${this.idMiembroActual}/actividades`;
      console.log('📡 POST actividad a:', url, body);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear actividad');
      }
      
      await this.cargarActividades();
      return true;
    } catch (error: any) {
      console.error('❌ Error:', error);
      this.error = error.message;
      return false;
    }
  }

  async eliminarActividadAPI(id: number): Promise<boolean> {
    try {
      const url = `${this.API_ACTIVIDADES_URL}/${id}`;
      console.log('📡 DELETE actividad a:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (response.status === 204 || response.status === 200) {
        await this.cargarActividades();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('❌ Error:', error);
      return false;
    }
  }

  // ==================== API TAREAS ====================
  
  async cargarTareas() {
    try {
      const url = `${this.API_TAREAS_URL}/hogares/${this.idHogarActual}/tareas`;
      console.log('📡 Fetching tareas from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (response.status === 401) {
        this.redirigirLogin();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Tareas recibidas:', data);
      
      this.tareas = data.map((tarea: any) => ({
        id: tarea.id_tarea,
        nombre: tarea.nombre,
        tipo: 'tarea',
        descripcion: tarea.descripcion,
        fecha: tarea.fecha ? new Date(tarea.fecha) : undefined,
        completada: tarea.realizada || false,
        id_miembro_f: tarea.id_miembro_f,
        duracion_minutos: tarea.duracion_minutos
      }));
      
    } catch (error: any) {
      console.error('❌ Error cargando tareas:', error);
      this.tareas = [];
    }
  }

  async crearTareaAPI(): Promise<boolean> {
    try {
      const body: any = {
        nombre: this.nuevaTareaNombre,
        descripcion: this.nuevaTareaDescripcion || null,
        solo_adulto: false,
        duracion_minutos: this.nuevaTareaDuracion,
        id_hogar_f: this.idHogarActual
      };
      
      if (this.nuevaTareaFecha) {
        body.fecha = this.nuevaTareaFecha;
      }
      if (this.nuevaTareaHora) {
        body.hora = this.nuevaTareaHora;
      }
      
      const url = `${this.API_TAREAS_URL}/hogares/${this.idHogarActual}/tareas`;
      console.log('📡 POST tarea a:', url, body);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear tarea');
      }
      
      const newTarea = await response.json();
      
      // Si hay miembro asignado, asignar la tarea
      if (this.idMiembroActual && newTarea.id_tarea) {
        await this.asignarTarea(newTarea.id_tarea);
      }
      
      await this.cargarTareas();
      return true;
    } catch (error: any) {
      console.error('❌ Error:', error);
      this.error = error.message;
      return false;
    }
  }

  async asignarTarea(idTarea: number) {
    try {
      const url = `${this.API_TAREAS_URL}/tareas/${idTarea}/asignar`;
      const body = {
        id_miembro: this.idMiembroActual,
        fecha: this.nuevaTareaFecha || new Date().toISOString().split('T')[0],
        hora: this.nuevaTareaHora || null,
        duracion_minutos: this.nuevaTareaDuracion,
        repetitiva: 0
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        console.error('Error asignando tarea:', await response.json());
      }
    } catch (error) {
      console.error('Error asignando tarea:', error);
    }
  }

  async completarTareaAPI(id: number): Promise<boolean> {
    try {
      const url = `${this.API_TAREAS_URL}/tareas/${id}/completar`;
      console.log('📡 PUT completar tarea a:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });
      
      if (response.ok) {
        await this.cargarTareas();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('❌ Error:', error);
      return false;
    }
  }

  async eliminarTareaAPI(id: number): Promise<boolean> {
    try {
      const url = `${this.API_TAREAS_URL}/tareas/${id}`;
      console.log('📡 DELETE tarea a:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (response.status === 204 || response.status === 200) {
        await this.cargarTareas();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('❌ Error:', error);
      return false;
    }
  }

  // ==================== MÉTODOS DEL CALENDARIO ====================
  
  toggleCalendario() {
    this.calendarioVisible = !this.calendarioVisible;
  }

  inicializarCalendario() {
    this.actualizarDisplayMes();
    this.generarDiasCalendario();
  }

  actualizarDisplayMes() {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    this.monthYearDisplay = `${meses[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  generarDiasCalendario() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const primerDiaMes = new Date(year, month, 1);
    const ultimoDiaMes = new Date(year, month + 1, 0);
    
    const diaInicioSemana = primerDiaMes.getDay();
    const totalDias = ultimoDiaMes.getDate();
    
    this.daysInCalendar = [];
    
    for (let i = 0; i < diaInicioSemana; i++) {
      this.daysInCalendar.push({ date: null, eventos: [] });
    }
    
    for (let i = 1; i <= totalDias; i++) {
      const fecha = new Date(year, month, i);
      this.daysInCalendar.push({ 
        date: fecha, 
        eventos: this.obtenerEventosDelDia(fecha)
      });
    }
    
    const celdasRestantes = 42 - this.daysInCalendar.length;
    for (let i = 0; i < celdasRestantes; i++) {
      this.daysInCalendar.push({ date: null, eventos: [] });
    }
  }

  obtenerEventosDelDia(fecha: Date): Evento[] {
    const eventos: Evento[] = [];
    
    this.actividades.forEach(actividad => {
      if (!actividad.completada && actividad.fechaHora && this.mismaFecha(actividad.fechaHora, fecha)) {
        eventos.push(actividad);
      }
    });
    
    this.tareas.forEach(tarea => {
      if (!tarea.completada && tarea.fecha && this.mismaFecha(tarea.fecha, fecha)) {
        eventos.push(tarea);
      }
    });
    
    return eventos;
  }

  mismaFecha(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  isToday(date: Date | null): boolean {
    if (!date) return false;
    const hoy = new Date();
    return this.mismaFecha(date, hoy);
  }

  getDayName(date: Date): string {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[date.getDay()];
  }

  cambiarMes(direccion: number) {
    this.currentDate.setMonth(this.currentDate.getMonth() + direccion);
    this.actualizarDisplayMes();
    this.generarDiasCalendario();
  }

  // ==================== MÉTODOS PARA ACTIVIDADES ====================
  
  async agregarActividad() {
    if (this.actualizando) return;
    this.actualizando = true;
    
    if (!this.nuevaActividadNombre || !this.nuevaActividadFechaHora) {
      this.error = 'Completa todos los campos obligatorios';
      this.actualizando = false;
      return;
    }
    
    const success = await this.crearActividadAPI();
    if (success) {
      this.limpiarFormularioActividad();
      this.generarDiasCalendario();
      this.cdr.detectChanges();
    }
    
    this.actualizando = false;
  }

  async completarActividad(actividad: Evento) {
    // Las actividades no tienen endpoint de completar por ahora
    actividad.completada = true;
    this.generarDiasCalendario();
  }

  async eliminarActividad(actividad: Evento) {
    if (confirm('¿Eliminar esta actividad?')) {
      const success = await this.eliminarActividadAPI(actividad.id);
      if (success) {
        this.generarDiasCalendario();
        this.cdr.detectChanges();
      }
    }
  }

  // ==================== MÉTODOS PARA TAREAS ====================
  
  async agregarTarea() {
    if (this.actualizando) return;
    this.actualizando = true;
    
    if (!this.nuevaTareaNombre) {
      this.error = 'El nombre de la tarea es obligatorio';
      this.actualizando = false;
      return;
    }
    
    const success = await this.crearTareaAPI();
    if (success) {
      this.limpiarFormularioTarea();
      this.generarDiasCalendario();
      this.cdr.detectChanges();
    }
    
    this.actualizando = false;
  }

  async completarTarea(tarea: Evento) {
    const success = await this.completarTareaAPI(tarea.id);
    if (success) {
      this.generarDiasCalendario();
      this.cdr.detectChanges();
    }
  }

  async eliminarTarea(tarea: Evento) {
    if (confirm('¿Eliminar esta tarea?')) {
      const success = await this.eliminarTareaAPI(tarea.id);
      if (success) {
        this.generarDiasCalendario();
        this.cdr.detectChanges();
      }
    }
  }

  // ==================== PROPIEDADES COMPUTADAS ====================
  
  get actividadesFiltradas(): Evento[] {
    switch(this.filtroActividades) {
      case 'pendientes':
        return this.actividades.filter(a => !a.completada);
      case 'completadas':
        return this.actividades.filter(a => a.completada);
      default:
        return this.actividades;
    }
  }

  get tareasFiltradas(): Evento[] {
    switch(this.filtroTareas) {
      case 'pendientes':
        return this.tareas.filter(t => !t.completada);
      case 'completadas':
        return this.tareas.filter(t => t.completada);
      default:
        return this.tareas;
    }
  }

  get actividadesPendientesCount(): number {
    return this.actividades.filter(a => !a.completada).length;
  }

  get tareasPendientesCount(): number {
    return this.tareas.filter(t => !t.completada).length;
  }

  // ==================== MÉTODOS AUXILIARES ====================
  
  obtenerTextoEvento(evento: Evento): string {
    if (evento.nombre.length > 12) {
      return evento.nombre.substring(0, 10) + '...';
    }
    return evento.nombre;
  }

  obtenerIconoEvento(evento: Evento): string {
    if (evento.completada) return '✓';
    return evento.tipo === 'actividad' ? '📅' : '✅';
  }

  limpiarFormularioActividad() {
    this.nuevaActividadNombre = '';
    this.nuevaActividadDescripcion = '';
    this.nuevaActividadFechaHora = '';
    this.error = '';
  }

  limpiarFormularioTarea() {
    this.nuevaTareaNombre = '';
    this.nuevaTareaDescripcion = '';
    this.nuevaTareaFecha = '';
    this.nuevaTareaHora = '';
    this.nuevaTareaDuracion = 30;
    this.error = '';
  }

  redirigirLogin() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}