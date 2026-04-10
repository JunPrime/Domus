// auth.service.ts
import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {
    // Verificar si hay usuario logueado al iniciar
    this.checkLoginStatus();
    
    // Escuchar cambios de autenticación
    this.document.addEventListener('authChange', ((event: CustomEvent) => {
      this.isLoggedInSubject.next(event.detail.isLoggedIn);
    }) as EventListener);
  }

  checkLoginStatus() {
    const usuario = localStorage.getItem('usuario');
    this.isLoggedInSubject.next(!!usuario);
  }

  getCurrentUser() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  logout() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_type');
    this.isLoggedInSubject.next(false);
    
    const evento = new CustomEvent('authChange', { 
      detail: { isLoggedIn: false, user: null } 
    });
    this.document.dispatchEvent(evento);
  }
}