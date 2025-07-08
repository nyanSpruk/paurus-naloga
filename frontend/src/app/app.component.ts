import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableComponent } from './components/table/table.component';

import { CommonModule } from '@angular/common';
import { AddmodalComponent } from './components/addmodal/addmodal.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ButtonModule,
    TableComponent,
    AddmodalComponent,
    CommonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'paurus-naloga';
}
