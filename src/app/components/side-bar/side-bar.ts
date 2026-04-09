import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-bar.html',
  styleUrls: ['./side-bar.css']
})
export class SideBar {
  abierto: boolean = false;
  
  @Output() estadoCambiado = new EventEmitter<boolean>();

  toggle() {
    this.abierto = !this.abierto;
    this.estadoCambiado.emit(this.abierto);
    console.log('Sidebar toggled, estado:', this.abierto);
  }
}