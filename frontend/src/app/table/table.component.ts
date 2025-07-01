import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { Student } from '../models/student';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  students: Student[] = [];
  totalRecords = 0;
  rows = 20;
  loading = false;

  constructor(private studentService: StudentService) {}

  lazyLoadStudents(event: TableLazyLoadEvent): void {
    this.loading = true;

    const first = event.first ?? 0;
    const rows = event.rows ?? 20;
    const page = first / rows + 1;

    this.studentService.getStudents(page, rows).subscribe((response) => {
      this.students = response.data;
      this.totalRecords = response.totalRecords;
      this.loading = false;
    });
  }
}
