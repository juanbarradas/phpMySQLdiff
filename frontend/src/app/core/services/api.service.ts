import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DbConnection, ConnectionTestResult, CompareResult,
  HistoryListResult, HistoryDetail
} from '../models/schema.model';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  testConnection(connection: DbConnection): Observable<ConnectionTestResult> {
    return this.http.post<ConnectionTestResult>(`${this.base}/api/test-connection`, { connection });
  }

  compare(origin: DbConnection, dest: DbConnection, ignoreFks = true): Observable<CompareResult> {
    return this.http.post<CompareResult>(`${this.base}/api/compare`, { origin, dest, ignore_fks: ignoreFks });
  }

  executeScript(dest: DbConnection, script: string): Observable<any> {
    return this.http.post<any>(`${this.base}/api/execute-script`, { connection: dest, script });
  }

  getHistory(limit = 20, offset = 0): Observable<HistoryListResult> {
    return this.http.get<HistoryListResult>(`${this.base}/api/history`, {
      params: { limit: limit.toString(), offset: offset.toString() }
    });
  }

  getHistoryEntry(id: number): Observable<HistoryDetail> {
    return this.http.get<HistoryDetail>(`${this.base}/api/history/${id}`);
  }

  deleteHistoryEntry(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.base}/api/history/${id}`);
  }
}
