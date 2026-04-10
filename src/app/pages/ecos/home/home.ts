import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
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

  mostrarModalEditar = false;
  hogarEditando: Hogar | null = null;
  nombreEditado = '';

  mostrarModal = false;
  nuevoTitulo = '';
  creando: boolean = false;

  // Colores fijos para las tarjetas
  coloresPastel: string[] = [
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
    private cdr: ChangeDetectorRef,
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
    console.log('🔄 Iniciando carga de hogares...');
    this.loading = true;
    this.cdr.detectChanges();
    
    try {
      const data = await this.hogarService.getHogares();
      
      if (data && Array.isArray(data) && data.length > 0) {
        this.hogares = data.map((hogar: any) => {
          const colorIndex = (hogar.id_hogar || 0) % this.coloresPastel.length;
          const color = this.coloresPastel[colorIndex];
          
          return {
            ...hogar,
            nombre_familiar: hogar.nombre_familiar || hogar.nombre_hogar || 'Sin nombre',
            color: color,
            textColor: this.textColors[color] || '#333'
          };
        });
      } else {
        this.hogares = [];
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      this.hogares = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
      console.log('🏁 loading =', this.loading);
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
  this.error = '';

  const result = await this.hogarService.crearHogar(this.nuevoTitulo.trim());
  
  if (result && (result.id_hogar || result.id)) {
    this.cerrarModal();
    setTimeout(() => {
      this.cargarHogares();
    }, 100);
  } else {
    this.error = result?.detail || 'Error al crear hogar';
  }
  
  // Usar setTimeout para cambiar creando a false
  setTimeout(() => {
    this.creando = false;
    this.cdr.detectChanges();
  }, 0);
}

  async eliminarHogar(event: Event, hogar: Hogar) {
    event.stopPropagation();
    
    const confirmar = confirm(`¿Eliminar el hogar "${hogar.nombre_familiar}"?`);
    if (!confirmar) return;
    
    try {
      const resultado = await this.hogarService.eliminarHogar(hogar.id_hogar);
      if (resultado) {
        alert('Hogar eliminado correctamente');
        this.cargarHogares();
      }
    } catch (error: any) {
      if (error?.message?.includes('associated members') || error?.status === 400) {
        alert('❌ No se puede eliminar el hogar porque tiene miembros asociados. Primero elimina los miembros del hogar.');
      } else {
        alert('Error al eliminar el hogar');
      }
    }
  }

  editarHogar(event: Event, hogar: Hogar) {
    this.abrirModalEditar(event, hogar);
  }

  entrarHogar(hogar: Hogar) {
    localStorage.setItem('hogar_actual', JSON.stringify(hogar));
    this.router.navigate(['/member']);
  }

  trackById(index: number, item: Hogar): number {
    return item.id_hogar;
  }

  abrirModalEditar(event: Event, hogar: Hogar) {
    event.stopPropagation();
    
    this.hogarEditando = hogar;
    this.nombreEditado = hogar.nombre_familiar;
    this.mostrarModalEditar = true;
  }
  
  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.hogarEditando = null;
    this.nombreEditado = '';
    this.error = '';
  }
  
  async guardarEdicion() {
  if (!this.nombreEditado.trim()) {
    this.error = 'Ingresa un nombre';
    return;
  }
  
  if (!this.hogarEditando) return;
  
  this.creando = true;
  
  const success = await this.hogarService.actualizarHogar(
    this.hogarEditando.id_hogar, 
    this.nombreEditado.trim()
  );
  
  if (success) {
    this.cerrarModalEditar();
    await this.cargarHogares();
  } else {
    this.error = 'Error al actualizar el hogar';
  }
  
  // Usar setTimeout para cambiar creando a false
  setTimeout(() => {
    this.creando = false;
    this.cdr.detectChanges();
  }, 0);

}
}