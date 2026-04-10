// components/side-bar/side-bar.ts
import { Component, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from "@angular/router";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './side-bar.html',
  styleUrls: ['./side-bar.css']
})
export class SideBar {
  abierto: boolean = false;
  private isBrowser: boolean;
  
  @Output() estadoCambiado = new EventEmitter<boolean>();

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  toggle() {
    this.abierto = !this.abierto;
    this.estadoCambiado.emit(this.abierto);
    
    if (this.isBrowser) {
      if (this.abierto) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.toggle();
  }
}