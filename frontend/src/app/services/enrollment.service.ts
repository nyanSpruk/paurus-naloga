import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LookupItem } from '../models/lookup-item';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private apiUrl = environment.apiUrl + '/enrollments';

  constructor(private http: HttpClient) {}

  getEnrollments(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(this.apiUrl);
  }
}
