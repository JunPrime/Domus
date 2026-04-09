import { Component, signal, ViewChild, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { SideBar } from './components/side-bar/side-bar';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [RouterOutlet, header, Footer, SideBar],
  templateUrl: './app.html',  
  styleUrls: ['./app.css']  
})
export class App implements OnDestroy {
  protected readonly title = signal('GamesLords');
  
  @ViewChild('sidebar') sidebar!: SideBar;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  toggleSidebar() {
    if (this.sidebar) {
      this.sidebar.toggle();
      
      // Solo ejecutar en el navegador
      if (this.isBrowser) {
        if (this.sidebar.abierto) {
          document.body.classList.add('sidebar-open');
        } else {
          document.body.classList.remove('sidebar-open');
        }
      }
    }
  }

  ngOnDestroy() {
    // Solo ejecutar en el navegador
    if (this.isBrowser) {
      document.body.classList.remove('sidebar-open');
    }
  }
}