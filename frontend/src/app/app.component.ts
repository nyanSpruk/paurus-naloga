import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableComponent } from './table/table.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, TableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'paurus-naloga';
}
