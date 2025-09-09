import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { UpsertExpenseRequest } from './expense.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  baseUrl = environment.apiBaseUrl;
  private http = inject(HttpClient);

  upsertExpense(body: UpsertExpenseRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/expense/UpsertExpense`, body);
  }

  getExpensesByGroupId(groupId?: string, latestOnly?: boolean) {
    const params = new HttpParams()
      .set('groupId', groupId ?? '')
      .set('latestOnly', latestOnly ?? true);

    return this.http.get(`${this.baseUrl}/api/expense/getexpensesbygroupid`, {
      params,
    });
  }

  getExpenseByExpenseId(expenseId: string) {
    const params = new HttpParams().set('groupId', expenseId ?? '');

    return this.http.get(`${this.baseUrl}/api/expense/getexpensesbyexpenseid`, {
      params,
    });
  }
}
