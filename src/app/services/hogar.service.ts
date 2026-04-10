import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Hogar {
  id_hogar: number;
  nombre_familiar: string;
  color?: string;
  textColor?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HogarService {
  private API_URL = 'https://codigo-production.up.railway.app/hogares/hogares/';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'bearer';
    return {
      'Authorization': `${tokenType} ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getHogares(): Promise<Hogar[]> {
    if (!this.isBrowser) return [];

    try {
      console.log('📡 Fetching hogares from:', this.API_URL);

      const token = localStorage.getItem('access_token');
      console.log('🔑 Token existe?', !!token);

      if (!token) {
        console.warn('⚠️ No hay token');
        return [];
      }

      const response = await fetch(this.API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('📥 Response status:', response.status);

      if (response.status === 401) {
        console.warn('⚠️ Token inválido o expirado');
        localStorage.removeItem('access_token');
        localStorage.removeItem('usuario');
        return [];
      }

      if (!response.ok) {
        console.error('❌ Error response:', response.status);
        return [];
      }

      const data = await response.json();
      console.log('📊 Data recibida:', JSON.stringify(data, null, 2));

      // Intentar extraer el array de diferentes formas
      let hogaresArray: any[] = [];

      if (Array.isArray(data)) {
        hogaresArray = data;
      } else if (typeof data === 'object' && data !== null) {
        // Buscar cualquier propiedad que sea un array
        for (const key in data) {
          if (Array.isArray(data[key])) {
            console.log(`📊 Encontrado array en propiedad "${key}"`);
            hogaresArray = data[key];
            break;
          }
        }
      }

      console.log('📊 Hogares extraídos:', hogaresArray.length);
      return hogaresArray;
    } catch (error) {
      console.error('❌ Error fetching hogares:', error);
      return [];
    }
  }
  async crearHogar(nombre: string): Promise<any> {
    if (!this.isBrowser) return null;

    try {
      console.log('📡 Creating hogar:', nombre);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          nombre_hogar: nombre,
          nombre_admin: nombre
        })
      });

      console.log('📥 Response status:', response.status);

      // ⚠️ Solo lee el JSON una vez
      const data = await response.json();
      console.log('📊 Response data:', data);

      return data;
    } catch (error) {
      console.error('❌ Error creating hogar:', error);
      return null;
    }
  }

  async eliminarHogar(id: number): Promise<boolean> {
    if (!this.isBrowser) return false;

    try {
      const url = `${this.API_URL}${id}`;
      console.log('📡 DELETE URL:', url);
      console.log('📡 Headers:', this.getAuthHeaders());
      console.log('📡 ID a eliminar:', id);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      console.log('📥 Response status:', response.status);

      // Intentar leer el cuerpo del error si no es 204
      if (response.status !== 204) {
        const errorText = await response.text();
        console.error('❌ Error body:', errorText);
      }

      return response.status === 204;
    } catch (error) {
      console.error('❌ Error deleting hogar:', error);
      return false;
    }
  }

  async actualizarHogar(id: number, nombre: string): Promise<boolean> {
    if (!this.isBrowser) return false;

    try {
      const response = await fetch(`${this.API_URL}${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ nombre_familiar: nombre })
      });
      return response.ok;
    } catch (error) {
      console.error('❌ Error updating hogar:', error);
      return false;
    }
  }
}