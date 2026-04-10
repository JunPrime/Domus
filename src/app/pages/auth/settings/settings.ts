import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings implements OnInit {
  @Output() settingsChanged = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();
  @Input() visible: boolean = false;  // Control externo de visibilidad
  
  // Configuraciones
  idiomaActual: 'es' | 'en' = 'es';
  
  paletaHeader: string = 'default';
  paletasDisponibles = [
    { id: 'default', nombre: 'Default Pastel', headerStart: '#AEC6CF', headerEnd: '#D4B8D4', footerStart: '#D4B8D4', footerEnd: '#FFD1DC' },
    { id: 'sunset', nombre: 'Sunset', headerStart: '#FFD1DC', headerEnd: '#FFB7C5', footerStart: '#FFB7C5', footerEnd: '#FFD8B1' },
    { id: 'ocean', nombre: 'Ocean', headerStart: '#AEC6CF', headerEnd: '#8BB3C0', footerStart: '#8BB3C0', footerEnd: '#B5EAD7' },
    { id: 'forest', nombre: 'Forest', headerStart: '#B5EAD7', headerEnd: '#9AD5B8', footerStart: '#9AD5B8', footerEnd: '#C7E9D0' },
    { id: 'lavender', nombre: 'Lavender', headerStart: '#D4B8D4', headerEnd: '#C2A0C2', footerStart: '#C2A0C2', footerEnd: '#E6E6FA' },
    { id: 'peach', nombre: 'Peach', headerStart: '#FFDAB9', headerEnd: '#FFC89A', footerStart: '#FFC89A', footerEnd: '#FFD1DC' },
    { id: 'mint', nombre: 'Mint', headerStart: '#B5EAD7', headerEnd: '#C7E9D0', footerStart: '#C7E9D0', footerEnd: '#E8F5E9' },
    { id: 'berry', nombre: 'Berry', headerStart: '#FFD1DC', headerEnd: '#D4B8D4', footerStart: '#D4B8D4', footerEnd: '#E6E6FA' }
  ];
  
  fuenteActual: string = 'quicksand';
  fuentesDisponibles = [
    { id: 'quicksand', nombre: 'Quicksand', css: "'Quicksand', sans-serif" },
    { id: 'poppins', nombre: 'Poppins', css: "'Poppins', sans-serif" },
    { id: 'roboto', nombre: 'Roboto', css: "'Roboto', sans-serif" },
    { id: 'opensans', nombre: 'Open Sans', css: "'Open Sans', sans-serif" },
    { id: 'lato', nombre: 'Lato', css: "'Lato', sans-serif" },
    { id: 'montserrat', nombre: 'Montserrat', css: "'Montserrat', sans-serif" },
    { id: 'nunito', nombre: 'Nunito', css: "'Nunito', sans-serif" },
    { id: 'inter', nombre: 'Inter', css: "'Inter', sans-serif" }
  ];
  
  tamanioFuente: number = 16;
  tamanioMin: number = 12;
  tamanioMax: number = 24;

  // Definir la interfaz para los textos
  textos: {
    es: Record<string, string>;
    en: Record<string, string>;
  } = {
    es: {
      titulo: 'Configuración',
      idioma: 'Idioma',
      español: 'Español',
      english: 'English',
      paletaHeader: 'Paleta de colores',
      fuente: 'Fuente',
      tamanioTexto: 'Tamaño del texto',
      reset: 'Restablecer valores',
      cerrar: 'Cerrar',
      guardar: 'Guardar cambios'
    },
    en: {
      titulo: 'Settings',
      idioma: 'Language',
      español: 'Spanish',
      english: 'English',
      paletaHeader: 'Color palette',
      fuente: 'Font',
      tamanioTexto: 'Text size',
      reset: 'Reset defaults',
      cerrar: 'Close',
      guardar: 'Save changes'
    }
  };

  ngOnInit() {
    this.cargarConfiguraciones();
    this.aplicarConfiguraciones();
  }

  cargarConfiguraciones() {
    const savedIdioma = localStorage.getItem('idioma');
    const savedPaleta = localStorage.getItem('paletaHeader');
    const savedFuente = localStorage.getItem('fuenteActual');
    const savedTamanio = localStorage.getItem('tamanioFuente');
    
    if (savedIdioma === 'es' || savedIdioma === 'en') this.idiomaActual = savedIdioma;
    if (savedPaleta) this.paletaHeader = savedPaleta;
    if (savedFuente) this.fuenteActual = savedFuente;
    if (savedTamanio) this.tamanioFuente = parseInt(savedTamanio);
  }

  cerrarSettings() {
    this.visible = false;
    this.close.emit();
  }

  aplicarConfiguraciones() {
    const fuenteSeleccionada = this.fuentesDisponibles.find(f => f.id === this.fuenteActual);
    if (fuenteSeleccionada) {
      document.body.style.fontFamily = fuenteSeleccionada.css;
    }
    
    document.body.style.fontSize = `${this.tamanioFuente}px`;
    
    const paleta = this.paletasDisponibles.find(p => p.id === this.paletaHeader);
    if (paleta) {
      document.documentElement.style.setProperty('--header-start', paleta.headerStart);
      document.documentElement.style.setProperty('--header-end', paleta.headerEnd);
      document.documentElement.style.setProperty('--footer-start', paleta.footerStart);
      document.documentElement.style.setProperty('--footer-end', paleta.footerEnd);
    }
    
    localStorage.setItem('idioma', this.idiomaActual);
    localStorage.setItem('paletaHeader', this.paletaHeader);
    localStorage.setItem('fuenteActual', this.fuenteActual);
    localStorage.setItem('tamanioFuente', this.tamanioFuente.toString());
    
    this.settingsChanged.emit({
      idioma: this.idiomaActual,
      paleta: this.paletaHeader,
      fuente: this.fuenteActual,
      tamanio: this.tamanioFuente
    });
  }

  cambiarIdioma(idioma: 'es' | 'en') {
    this.idiomaActual = idioma;
    this.aplicarConfiguraciones();
  }

  cambiarPaleta(paletaId: string) {
    this.paletaHeader = paletaId;
    this.aplicarConfiguraciones();
  }

  cambiarFuente(fuenteId: string) {
    this.fuenteActual = fuenteId;
    this.aplicarConfiguraciones();
  }

  cambiarTamanioFuente(incremento: number) {
    const nuevoTamanio = this.tamanioFuente + incremento;
    if (nuevoTamanio >= this.tamanioMin && nuevoTamanio <= this.tamanioMax) {
      this.tamanioFuente = nuevoTamanio;
      this.aplicarConfiguraciones();
    }
  }

  resetearConfiguraciones() {
    this.idiomaActual = 'es';
    this.paletaHeader = 'default';
    this.fuenteActual = 'quicksand';
    this.tamanioFuente = 16;
    this.aplicarConfiguraciones();
  }

  // Método de traducción corregido
  t(key: string): string {
    const translations = this.textos[this.idiomaActual];
    return translations[key] || key;
  }
}