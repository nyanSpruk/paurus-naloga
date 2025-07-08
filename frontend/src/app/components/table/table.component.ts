import { Component, OnDestroy, ViewChild } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student';
import { TableLazyLoadEvent } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AddmodalComponent } from '../addmodal/addmodal.component';
import { EditCoursesModalComponent } from '../edit-courses-modal/edit-courses-modal.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [TableModule, ButtonModule, CommonModule, EditCoursesModalComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnDestroy {
  @ViewChild('addStudentModal') addStudentModal!: AddmodalComponent;
  @ViewChild('editCoursesModal') editCoursesModal!: EditCoursesModalComponent;

  students: Student[] = [];
  totalRecords: number = 0;
  rows: number = 20;
  loading: boolean = false;

  displayEditCoursesModal: boolean = false;
  selectedStudentForCoursesEdit: Student | null = null;

  private destroy$ = new Subject<void>();

  constructor(private studentService: StudentService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  lazyLoadStudents(event: TableLazyLoadEvent): void {
    this.loading = true;
    const page = event.first! / event.rows! + 1;
    const limit = event.rows!;

    this.studentService
      .getStudents(page, limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.students = data.data;
          this.totalRecords = data.totalRecords;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading students:', error);
          this.loading = false;
        },
      });
  }

  deleteStudent(id: string): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.loading = true;
      this.studentService
        .deleteStudent(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Student deleted successfully');
            this.lazyLoadStudents({ first: 0, rows: this.rows });
          },
          error: (error) => {
            console.error('Error deleting student:', error);
            this.loading = false;
          },
        });
    }
  }

  openAddStudentModal(): void {
    this.addStudentModal.showDialog();
  }
  onStudentAdded(event: Event): void {
    const newStudent = (event as CustomEvent).detail;
    console.log('New student added:', newStudent);
    this.lazyLoadStudents({ first: 0, rows: this.rows });
  }

  openEditCoursesModal(student: Student): void {
    this.selectedStudentForCoursesEdit = student;
    this.displayEditCoursesModal = true;
  }

  onStudentCoursesUpdated(updatedStudent: Student): void {
    console.log('Student courses updated:', updatedStudent);
    this.lazyLoadStudents({ first: 0, rows: this.rows });
    this.displayEditCoursesModal = false;
    this.selectedStudentForCoursesEdit = null;
  }

  onEditCoursesModalVisibleChange(visible: boolean): void {
    this.displayEditCoursesModal = visible;
    if (!visible) {
      this.selectedStudentForCoursesEdit = null;
    }
  }
}
