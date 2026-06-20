import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TransactionRequest, TransactionResponse } from '../models/transaction.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  initiatePayment(request: TransactionRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(this.apiUrl, request);
  }

  getSalesHistory(boutiqueId: string, page: number = 0, size: number = 10): Observable<Page<TransactionResponse>> {
    return this.http.get<Page<TransactionResponse>>(`${this.apiUrl}/boutique/${boutiqueId}`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  getTransactionsByStudent(studentId: string, page: number = 0, size: number = 10): Observable<Page<TransactionResponse>> {
    return this.http.get<Page<TransactionResponse>>(`${this.apiUrl}/student/${studentId}`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  getTransactionById(trackingId: string): Observable<TransactionResponse> {
    return this.http.get<TransactionResponse>(`${this.apiUrl}/${trackingId}`);
  }

  getGlobalStats(): Observable<any> { // Assuming a stats model if needed
    return this.http.get<any>(`${this.apiUrl}/stats/global`);
  }


  findByTrackingId(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  findByBoutiqueId(boutiqueId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/boutique/${boutiqueId}`);
  }

  findByStudentId(studentId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/student/${studentId}`);
  }
}
