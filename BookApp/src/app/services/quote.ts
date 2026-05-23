import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// const API = 'http://localhost:5066/api/quotes'; // local
const API = 'https://bookapp-sxjz.onrender.com/api/quotes'; // production

export interface Quote {
  id?: number;
  text: string;
  author: string;
}

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private http = inject(HttpClient);

  getAll() { return this.http.get<Quote[]>(API); }
  create(quote: Quote) { return this.http.post<Quote>(API, quote); }
  update(id: number, quote: Quote) { return this.http.put<Quote>(`${API}/${id}`, quote); }
  delete(id: number) { return this.http.delete(`${API}/${id}`); }
}
