import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:5066/api/books';

export interface Book {
  id?: number;
  title: string;
  author: string;
  publishedDate: string;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);

  getAll() { return this.http.get<Book[]>(API); }
  create(book: Book) { return this.http.post<Book>(API, book); }
  update(id: number, book: Book) { return this.http.put<Book>(`${API}/${id}`, book); }
  delete(id: number) { return this.http.delete(`${API}/${id}`); }
}
