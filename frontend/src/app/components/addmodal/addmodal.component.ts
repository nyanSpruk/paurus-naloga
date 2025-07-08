import { Component, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student';
import {
  Observable,
  Subject,
  takeUntil,
  first,
  switchMap,
  forkJoin,
} from 'rxjs';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { EnrollmentService } from '../../services/enrollment.service';
import { StatusService } from '../../services/status.service';
import { YearService } from '../../services/year.service';
import { LookupItem } from '../../models/lookup-item';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course';
import { ProgramService } from '../../services/program.service';

@Component({
  selector: 'app-addmodal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    SelectModule,
    CalendarModule,
    MessageModule,
    DialogModule,
    MultiSelectModule,
  ],
  templateUrl: './addmodal.component.html',
  styleUrl: './addmodal.component.css',
})
export class AddmodalComponent implements OnDestroy {
  userForm: FormGroup;
  errorMessage: string | null = null;
  createdStudent: Student | null = null;
  generatedId: string | null = null;
  visible: boolean = false;

  programs: LookupItem[] = [];
  years: LookupItem[] = [];
  statuses: LookupItem[] = [];
  enrollments: LookupItem[] = [];
  courses: Course[] = [];

  private destroy$ = new Subject<void>();

  formFieldsConfig: {
    [key: string]: {
      label: string;
      validators: any[];
    };
  } = {
    name: {
      label: 'First Name',
      validators: [Validators.required, Validators.minLength(2)],
    },
    lastname: {
      label: 'Last Name',
      validators: [Validators.required, Validators.minLength(2)],
    },
    program: { label: 'Program', validators: [Validators.required] },
    year: { label: 'Year', validators: [Validators.required] },
    status: { label: 'Status', validators: [Validators.required] },
    enrollment: { label: 'Enrollment', validators: [Validators.required] },
    courses: {
      label: 'Courses',
      validators: [Validators.required, Validators.maxLength(5)],
    },
  };

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private programService: ProgramService,
    private yearService: YearService,
    private statusService: StatusService,
    private enrollmentService: EnrollmentService,
    private courseService: CourseService
  ) {
    this.userForm = this.fb.group(this.buildFormControls());
  }

  // https://www.learnrxjs.io/learn-rxjs/operators/combination/forkjoin
  private loadLookupData(): void {
    forkJoin({
      programs: this.programService.getPrograms(),
      years: this.yearService.getYears(),
      statuses: this.statusService.getStatuses(),
      enrollments: this.enrollmentService.getEnrollments(),
      courses: this.courseService.getCourses(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.programs = data.programs;
          this.years = data.years;
          this.statuses = data.statuses;
          this.enrollments = data.enrollments;
          this.courses = data.courses;
        },
        error: (error) => {
          console.error('Error loading lookup data:', error);
          this.errorMessage = 'Failed to load form options. Please try again.';
        },
      });
  }

  ngOnInit(): void {
    this.loadLookupData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildFormControls() {
    const controls: { [key: string]: any } = {};
    for (const fieldName in this.formFieldsConfig) {
      if (this.formFieldsConfig.hasOwnProperty(fieldName)) {
        const config =
          this.formFieldsConfig[
            fieldName as keyof typeof this.formFieldsConfig
          ];
        controls[fieldName] = ['', config.validators];
      }
    }
    return controls;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      console.log('Form is invalid');
      this.markFormGroupTouched(this.userForm);
      this.errorMessage = 'Please fill out all required fields.';
      return;
    }

    this.errorMessage = null;

    this.generateUniqueStudentId()
      .pipe(
        // https://angular.love/takeuntildestroy-in-angular-v16/
        takeUntil(this.destroy$),
        switchMap((uniqueId: string) => {
          this.generatedId = uniqueId;
          const formData: Student = {
            ...this.userForm.value,
            studentNumber: uniqueId,
          };
          return this.studentService.addStudent(formData);
        })
      )
      .subscribe({
        next: (createdStudentResponse) => {
          this.createdStudent = createdStudentResponse;
          this.userForm.reset();
          this.visible = false;
        },
        error: (creationError) => {
          console.error('Error creating student:', creationError);
          this.errorMessage = 'Failed to create student. Please try again.';
        },
      });
  }

  private createPotentialStudentId(): string {
    const program = this.userForm.get('program')?.value;
    let prefix = '';
    switch (program) {
      case 'Computer and Information Science':
        prefix = '632';
        break;
      case 'Computer and Mathematical Science':
        prefix = '633';
        break;
      case 'Digital Arts':
        prefix = '634';
        break;
      default:
        prefix = '000';
    }
    const randomNumbers = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${randomNumbers}`;
  }

  private generateUniqueStudentId(): Observable<string> {
    const maxAttempts = 10;
    let attempts = 0;

    return new Observable<string>((observer) => {
      const tryGenerate = () => {
        if (attempts >= maxAttempts) {
          observer.error(
            new Error(
              `Failed to generate a unique ID after ${maxAttempts} attempts.`
            )
          );
          return;
        }

        const potentialId = this.createPotentialStudentId();

        this.studentService
          .getStudentByStudentId(potentialId)
          .pipe(first())
          .subscribe({
            next: (student: Student | null) => {
              if (student) {
                console.warn(`ID ${potentialId} already exists. Retrying...`);
                attempts++;
                setTimeout(tryGenerate, 100); // Retry after a short delay
              } else {
                console.log(`ID ${potentialId} is unique!`);
                observer.next(potentialId);
                observer.complete();
              }
            },
            error: (error) => {
              console.error('Error checking student ID:', error);
              observer.error(new Error('API error during ID check.'));
            },
          });
      };

      tryGenerate();
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    const fieldLabel = this.formFieldsConfig[fieldName].label || fieldName;

    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldLabel} is required.`;
      if (field.errors['email']) return 'Please enter a valid email.';
      if (field.errors['minlength'])
        return `${fieldLabel} must be at least ${field.errors['minlength'].requiredLength}.`;
      if (field.errors['maxlength'])
        return `${fieldLabel} cannot exceed ${field.errors['maxlength'].requiredLength}.`;
      if (field.errors['pattern']) return 'Please enter a valid format.';
    }
    return '';
  }

  showDialog(): void {
    this.visible = !this.visible;
  }
}
