import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Student, StudentApiResponse } from '../models/student';
import { ApiPaginatedResponse } from '../models/api';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/students';

  getStudents(page: number, perPage: number): Observable<StudentApiResponse> {
    const params = new HttpParams()
      .set('_page', page.toString())
      .set('_per_page', perPage.toString());

    return this.http
      .get<ApiPaginatedResponse<Student>>(this.apiUrl, {
        params,
      })
      .pipe(
        map((response) => {
          if (!response) {
            return { data: [], totalRecords: 0 };
          }
          return {
            data: response.data || [],
            totalRecords: response.items || 0,
          };
        })
      );
  }

  deleteStudent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addStudent(student: Student): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, student);
  }

  getStudentById(id: string): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  getStudentByStudentId(studentId: string): Observable<Student | null> {
    return this.http
      .get<Student[]>(`${this.apiUrl}?studentNumber=${studentId}`)
      .pipe(
        map((students) => {
          if (students && students.length > 0) {
            return students[0];
          }
          return null;
        }),
        catchError((error) => {
          console.error('Error fetching student by studentNumber:', error);
          // If error also return null.
          return of(null);
        })
      );
  }
}
