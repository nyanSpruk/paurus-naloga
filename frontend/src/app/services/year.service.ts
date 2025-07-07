import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LookupItem } from '../models/lookup-item';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class YearService {
  private apiUrl = environment.apiUrl + '/years';

  constructor(private http: HttpClient) {}

  getYears(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(this.apiUrl);
  }
}
