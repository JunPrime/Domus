import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HogarService, Hogar } from '../../../services/hogar.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class home implements OnInit {
  hogares: Hogar[] = [];
  loading: boolean = true;
  error: string = '';
  private isBrowser: boolean;

  mostrarModal = false;
  nuevoTitulo = '';
  nuevoColor = '#B8E0D2';
  creando: boolean = false;

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

  constructor(
    private router: Router,
    private hogarService: HogarService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.cargarHogares();
    }
  }

  async cargarHogares() {
  this.loading = true;
  
  try {
    const data = await this.hogarService.getHogares();
    console.log('📊 Datos recibidos en home:', data);
    
    if (Array.isArray(data)) {
      this.hogares = data.map((hogar: any) => ({
        ...hogar,
        color: this.coloresPastel[hogar.id_hogar % this.coloresPastel.length],
        textColor: this.textColors[this.coloresPastel[hogar.id_hogar % this.coloresPastel.length]] || '#333'
      }));
    } else {
      this.hogares = [];
    }
    
    console.log('🏠 Hogares procesados:', this.hogares.length);
  } catch (error) {
    console.error('❌ Error en cargarHogares:', error);
    this.hogares = [];
  } finally {
    this.loading = false;
  }
}

  abrirModal() {
    this.mostrarModal = true;
    this.nuevoTitulo = '';
    this.error = '';
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevoTitulo = '';
  }

  async guardarHogar() {
  if (!this.nuevoTitulo.trim()) {
    this.error = 'Ingresa un nombre';
    return;
  }

  this.creando = true;

  const result = await this.hogarService.crearHogar(this.nuevoTitulo.trim());
  
  if (result && (result.id_hogar || result.id)) {
    this.cerrarModal();
    
    // Forzar actualización después de un pequeño retraso
    setTimeout(() => {
      this.cargarHogares();
    }, 100);
  } else {
    this.error = result?.detail || 'Error al crear hogar';
  }
  
  this.creando = false;
}

 async eliminarHogar(hogar: Hogar) {  // ← Recibe el objeto, no el ID
  const confirmar = confirm(`¿Eliminar el hogar "${hogar.nombre_familiar}"?`);
  if (!confirmar) return;
  
  try {
    const resultado = await this.hogarService.eliminarHogar(hogar.id_hogar);  // ← Usa hogar.id_hogar
    if (resultado) {
      alert('Hogar eliminado correctamente');
      this.cargarHogares(); // Recargar lista
    }
  } catch (error: any) {
    // Verificar si el error es por miembros asociados
    if (error?.message?.includes('associated members') || error?.status === 400) {
      alert('❌ No se puede eliminar el hogar porque tiene miembros asociados. Primero elimina los miembros del hogar.');
    } else {
      alert('Error al eliminar el hogar');
    }
  }
}

  async editarHogar(hogar: Hogar) {
    const nuevoNombre = prompt('Nuevo nombre:', hogar.nombre_familiar);
    if (!nuevoNombre || !nuevoNombre.trim()) return;
    
    const success = await this.hogarService.actualizarHogar(hogar.id_hogar, nuevoNombre.trim());
    if (success) {
      await this.cargarHogares();
    } else {
      this.error = 'Error al actualizar';
    }
  }

  entrarHogar(hogar: Hogar) {
    localStorage.setItem('hogar_actual', JSON.stringify(hogar));
    this.router.navigate(['/members']);
  }

  trackById(index: number, item: Hogar): number {
    return item.id_hogar;
  }
  
}