import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { Student } from '../models/student';
import { StudentService } from '../services/student.service';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    IconFieldModule,
    ToolbarModule,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  students: Student[] = [];
  totalRecords = 0;
  rows = 20;
  loading = false;

  deleteStudent(id: string): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.studentService.deleteStudent(id).subscribe(() => {
        this.students = this.students.filter((student) => student.id !== id);
        this.totalRecords--;
      });
    }
  }

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
