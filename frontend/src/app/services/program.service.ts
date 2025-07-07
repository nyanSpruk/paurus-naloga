import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LookupItem } from '../models/lookup-item';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProgramService {
  private apiUrl = environment.apiUrl + '/programs';

  constructor(private http: HttpClient) {}

  getPrograms(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(this.apiUrl);
  }
}
