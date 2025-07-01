import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Student, StudentApiResponse } from '../models/student';
import { ApiPaginatedResponse } from '../models/api';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/students';

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
}
