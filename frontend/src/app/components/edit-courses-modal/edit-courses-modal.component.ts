import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageModule } from 'primeng/message';

import { Student } from '../../models/student';
import { Course } from '../../models/course';
import { CourseService } from '../../services/course.service';
import { StudentService } from '../../services/student.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-edit-courses-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    MultiSelectModule,
    MessageModule,
  ],
  templateUrl: './edit-courses-modal.component.html',
  styleUrl: './edit-courses-modal.component.css',
})
export class EditCoursesModalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() studentToEdit: Student | null = null;
  @Input() visible: boolean = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() studentCoursesUpdated = new EventEmitter<Student>();

  editCoursesForm: FormGroup;
  courses: Course[] = [];
  errorMessage: string | null = null;
  formSubmitted: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private studentService: StudentService
  ) {
    this.editCoursesForm = this.fb.group({
      courses: [[], [Validators.required, Validators.maxLength(5)]],
    });
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['studentToEdit'] && this.studentToEdit) {
      this.populateForm();
    }
    if (changes['visible'] && !this.visible) {
      this.resetFormAndErrors();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCourses(): void {
    this.courseService
      .getCourses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.courses = data;
          if (this.studentToEdit) {
            this.populateForm();
          }
        },
        error: (error) => {
          console.error('Error loading courses:', error);
          this.errorMessage = 'Failed to load courses. Please try again.';
        },
      });
  }

  private populateForm(): void {
    if (this.studentToEdit && this.courses.length > 0) {
      const selectedCourseIds = this.studentToEdit.courses
        ? this.studentToEdit.courses.map((c) => c)
        : [];
      this.editCoursesForm.get('courses')?.setValue(selectedCourseIds);
      this.editCoursesForm.markAsPristine();
      this.editCoursesForm.markAsUntouched();
    }
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.editCoursesForm.invalid) {
      console.log('Edit courses form is invalid');
      this.markFormGroupTouched(this.editCoursesForm);
      this.errorMessage = 'Please select valid courses.';
      return;
    }

    if (!this.studentToEdit || !this.studentToEdit.id) {
      this.errorMessage = 'Student data not available for update.';
      return;
    }

    this.errorMessage = null;

    const selectedCourseIds: string[] =
      this.editCoursesForm.get('courses')?.value || [];
    const updatedCourses: Course[] = this.courses.filter((course) =>
      selectedCourseIds.includes(course.id)
    );

    const updatedCourseIds = updatedCourses.map((course) => course.id);
    const studentToUpdate: Student = {
      ...this.studentToEdit,
      courses: updatedCourseIds,
    };

    this.studentService
      .updateStudent(studentToUpdate.id!, studentToUpdate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Student courses updated successfully:', response);
          this.studentCoursesUpdated.emit(response);
          this.hideDialog();
        },
        error: (error) => {
          console.error('Error updating student courses:', error);
          this.errorMessage = 'Failed to update courses. Please try again.';
        },
      });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editCoursesForm.get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || this.formSubmitted)
    );
  }

  getFieldError(fieldName: string): string {
    const field = this.editCoursesForm.get(fieldName);
    const label = 'Courses';

    if (field?.errors) {
      if (field.errors['required']) return `${label} are required.`;
      if (field.errors['maxlength'])
        return `${label} cannot exceed ${field.errors['maxlength'].requiredLength} courses.`;
    }
    return '';
  }

  hideDialog(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.resetFormAndErrors();
  }

  private resetFormAndErrors(): void {
    this.editCoursesForm.reset();
    this.errorMessage = null;
    this.formSubmitted = false;
    this.studentToEdit = null;
  }
}
