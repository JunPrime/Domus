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
      
      const response = await fetch(this.API_URL, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      console.log('📥 Response status:', response.status);
      
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        return [];
      }
      
      if (!response.ok) {
        console.error('❌ Error response:', response.status);
        return [];
      }
      
      // ⚠️ IMPORTANTE: Solo lee el JSON una vez
      const data = await response.json();
      console.log('✅ Hogares fetched successfully');
      console.log('📊 Hogares data:', data);
      
      return data;
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