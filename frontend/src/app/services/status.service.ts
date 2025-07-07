import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LookupItem } from '../models/lookup-item';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private apiUrl = environment.apiUrl + '/statuses';

  constructor(private http: HttpClient) {}

  getStatuses(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(this.apiUrl);
  }
}
