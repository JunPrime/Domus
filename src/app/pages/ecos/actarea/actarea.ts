import { Component, OnInit, AfterViewInit } from '@angular/core';

export type Actividad = {
  id: string;
  nombre: string;
  fechaHora: Date;
  tipo: 'actividad';
};

export type Tarea = {
  id: string;
  nombre: string;
  fecha: Date;
  completada: boolean;
  tipo: 'tarea';
};

@Component({
  selector: 'app-actarea',
  templateUrl: './actarea.html',
  styleUrls: ['./actarea.css']
})
export class ActareaComponent implements OnInit, AfterViewInit {
  actividades: Actividad[] = [];
  tareas: Tarea[] = [];
  currentDate: Date = new Date();

  constructor() {}

  ngOnInit(): void {
    this.cargarStorage();
  }

  ngAfterViewInit(): void {
    this.renderizarTodo();
    this.asignarEventosGlobales();
  }

  generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  guardarEnStorage(): void {
     if (typeof localStorage === 'undefined') return;
    const data = {
      actividades: this.actividades.map(a => ({ ...a, fechaHora: a.fechaHora.toISOString() })),
      tareas: this.tareas.map(t => ({ ...t, fecha: t.fecha.toISOString() }))
    };
    localStorage.setItem('planificador_data', JSON.stringify(data));
  }

  cargarStorage(): void {
     if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem('planificador_data');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.actividades) {
        this.actividades = data.actividades.map((a: any) => ({
          ...a,
          fechaHora: new Date(a.fechaHora),
          tipo: 'actividad'
        }));
      }
      if (data.tareas) {
        this.tareas = data.tareas.map((t: any) => ({
          ...t,
          fecha: new Date(t.fecha),
          tipo: 'tarea',
          completada: t.completada ?? false
        }));
      }
    } catch(e) {
      console.warn(e);
    }
  }

  obtenerEventosDelDia(fecha: Date): (Actividad | Tarea)[] {
    const year = fecha.getFullYear();
    const month = fecha.getMonth();
    const day = fecha.getDate();

    const actividadesDelDia = this.actividades.filter(act => {
      const actDate = act.fechaHora;
      return actDate.getFullYear() === year && actDate.getMonth() === month && actDate.getDate() === day;
    });

    const tareasDelDia = this.tareas.filter(t => {
      if (t.completada) return false;
      const tareaDate = t.fecha;
      return tareaDate.getFullYear() === year && tareaDate.getMonth() === month && tareaDate.getDate() === day;
    });

    return [...actividadesDelDia, ...tareasDelDia];
  }

  renderizarCalendario(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthYearDisplay = document.getElementById('monthYearDisplay');
    if (monthYearDisplay) {
      monthYearDisplay.textContent = firstDayOfMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }

    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;
    calendarGrid.innerHTML = '';

    for (let i = 0; i < startWeekday; i++) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'calendar-day empty';
      calendarGrid.appendChild(emptyDiv);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d);
      const dayDiv = document.createElement('div');
      dayDiv.className = 'calendar-day';

      const dayNumberSpan = document.createElement('span');
      dayNumberSpan.className = 'day-number';
      dayNumberSpan.textContent = d.toString();
      dayDiv.appendChild(dayNumberSpan);

      const eventos = this.obtenerEventosDelDia(dayDate);
      eventos.sort((a, b) => {
        if (a.tipo === 'actividad' && b.tipo === 'tarea') return -1;
        if (a.tipo === 'tarea' && b.tipo === 'actividad') return 1;
        return 0;
      });

      for (const ev of eventos) {
        const badge = document.createElement('div');
        badge.className = `event-badge ${ev.tipo === 'actividad' ? 'badge-actividad' : 'badge-tarea'}`;
        let texto = ev.nombre;
        if (ev.tipo === 'actividad') {
          const hora = (ev as Actividad).fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          texto = `${ev.nombre} (${hora})`;
        } else {
          texto = `🧹 ${ev.nombre}`;
        }
        badge.textContent = texto;
        dayDiv.appendChild(badge);
      }
      calendarGrid.appendChild(dayDiv);
    }
  }

  renderizarListas(): void {
    const listaActividadesUl = document.getElementById('listaActividades');
    if (listaActividadesUl) {
      listaActividadesUl.innerHTML = '';
      this.actividades.forEach(act => {
        const li = document.createElement('li');
        const fechaFormateada = act.fechaHora.toLocaleString();
        li.innerHTML = `
          <span><strong>${act.nombre}</strong><br><small>📅 ${fechaFormateada}</small></span>
          <button class="btn-eliminar" data-id="${act.id}" data-tipo="actividad">🗑️</button>
        `;
        listaActividadesUl.appendChild(li);
      });
    }

    const listaTareasPendientesUl = document.getElementById('listaTareasPendientes');
    if (listaTareasPendientesUl) {
      const tareasPendientes = this.tareas.filter(t => !t.completada);
      listaTareasPendientesUl.innerHTML = '';
      tareasPendientes.forEach(t => {
        const li = document.createElement('li');
        const fechaStr = t.fecha.toLocaleDateString();
        li.innerHTML = `
          <span class="tarea-text">📌 ${t.nombre} <span class="fecha-text">(📆 ${fechaStr})</span></span>
          <div>
            <button class="btn-completar" data-id="${t.id}" data-tipo="tarea-completar">✔️ Completar</button>
            <button class="btn-eliminar" data-id="${t.id}" data-tipo="tarea-eliminar">🗑️</button>
          </div>
        `;
        listaTareasPendientesUl.appendChild(li);
      });
    }

    const listaTareasCompletadasUl = document.getElementById('listaTareasCompletadas');
    if (listaTareasCompletadasUl) {
      const tareasCompletadas = this.tareas.filter(t => t.completada);
      listaTareasCompletadasUl.innerHTML = '';
      tareasCompletadas.forEach(t => {
        const li = document.createElement('li');
        const fechaStr = t.fecha.toLocaleDateString();
        li.innerHTML = `
          ✅ ${t.nombre} <span style="font-size:0.7rem;">(completada - ${fechaStr})</span>
          <button class="btn-eliminar" data-id="${t.id}" data-tipo="tarea-eliminar-completada" style="background:#b91c1c; margin-left:8px;">🗑️</button>
        `;
        listaTareasCompletadasUl.appendChild(li);
      });
    }
  }

  asignarEventosGlobales(): void {
    // Botones de navegación
    const prevBtn = document.getElementById('prevMonthBtn');
    const nextBtn = document.getElementById('nextMonthBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.cambiarMes(-1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.cambiarMes(1));
    }

    // Botones de agregar
    const addActividadBtn = document.getElementById('agregarActividadBtn');
    const addTareaBtn = document.getElementById('agregarTareaBtn');
    if (addActividadBtn) {
      addActividadBtn.addEventListener('click', () => this.agregarActividad());
    }
    if (addTareaBtn) {
      addTareaBtn.addEventListener('click', () => this.agregarTarea());
    }

    // Eventos dinámicos para botones generados
    document.body.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // Eliminar actividad
      if (target.classList.contains('btn-eliminar') && target.dataset['tipo'] === 'actividad') {
        const id = target.dataset['id'];
        if (id) {
          this.actividades = this.actividades.filter(a => a.id !== id);
          this.guardarEnStorage();
          this.renderizarTodo();
        }
      }
      
      // Completar tarea
      if (target.classList.contains('btn-completar') && target.dataset['tipo'] === 'tarea-completar') {
        const id = target.dataset['id'];
        if (id) {
          const tarea = this.tareas.find(t => t.id === id);
          if (tarea && !tarea.completada) {
            tarea.completada = true;
            this.guardarEnStorage();
            this.renderizarTodo();
          }
        }
      }
      
      // Eliminar tarea pendiente
      if (target.classList.contains('btn-eliminar') && target.dataset['tipo'] === 'tarea-eliminar') {
        const id = target.dataset['id'];
        if (id) {
          this.tareas = this.tareas.filter(t => t.id !== id);
          this.guardarEnStorage();
          this.renderizarTodo();
        }
      }
      
      // Eliminar tarea completada
      if (target.classList.contains('btn-eliminar') && target.dataset['tipo'] === 'tarea-eliminar-completada') {
        const id = target.dataset['id'];
        if (id) {
          this.tareas = this.tareas.filter(t => t.id !== id);
          this.guardarEnStorage();
          this.renderizarTodo();
        }
      }
    });
  }

  renderizarTodo(): void {
    this.renderizarCalendario();
    this.renderizarListas();
  }

  agregarActividad(): void {
    const nombreInput = document.getElementById('actividadNombre') as HTMLInputElement;
    const fechaHoraInput = document.getElementById('actividadFechaHora') as HTMLInputElement;
    
    const nombre = nombreInput?.value.trim() || '';
    const fechaHoraStr = fechaHoraInput?.value || '';
    
    if (!nombre) {
      alert('Escribe el nombre de la actividad');
      return;
    }
    if (!fechaHoraStr) {
      alert('Selecciona fecha y hora para la actividad');
      return;
    }
    const fechaHora = new Date(fechaHoraStr);
    if (isNaN(fechaHora.getTime())) {
      alert('Fecha/hora inválida');
      return;
    }

    const nuevaActividad: Actividad = {
      id: this.generarId(),
      nombre: nombre,
      fechaHora: fechaHora,
      tipo: 'actividad'
    };
    this.actividades.push(nuevaActividad);
    this.guardarEnStorage();

    if (nombreInput) nombreInput.value = '';
    if (fechaHoraInput) fechaHoraInput.value = '';
    this.renderizarTodo();
  }

  agregarTarea(): void {
    const nombreInput = document.getElementById('tareaNombre') as HTMLInputElement;
    const fechaInput = document.getElementById('tareaFecha') as HTMLInputElement;
    
    const nombre = nombreInput?.value.trim() || '';
    const fechaStr = fechaInput?.value || '';
    
    if (!nombre) {
      alert('Escribe el nombre de la tarea');
      return;
    }
    if (!fechaStr) {
      alert('Selecciona una fecha para la tarea');
      return;
    }
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) {
      alert('Fecha inválida');
      return;
    }

    const nuevaTarea: Tarea = {
      id: this.generarId(),
      nombre: nombre,
      fecha: fecha,
      completada: false,
      tipo: 'tarea'
    };
    this.tareas.push(nuevaTarea);
    this.guardarEnStorage();

    if (nombreInput) nombreInput.value = '';
    if (fechaInput) fechaInput.value = '';
    this.renderizarTodo();
  }

  cambiarMes(delta: number): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + delta, 1);
    this.renderizarCalendario();
  }
}