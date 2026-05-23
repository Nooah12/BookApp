import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

// const API = 'http://localhost:5066/api/auth'; // local
const API = 'https://bookapp-sxjz.onrender.com/api/auth'; // production


@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  register(username: string, password: string) {
    return this.http.post(`${API}/register`, { username, password });
  }

  login(username: string, password: string) {
    return this.http.post<{ token: string }>(`${API}/login`, { username, password }).pipe(
      tap(res => localStorage.setItem('token', res.token))
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};

export const authGuard = () => {
  const router = inject(Router);
  if (localStorage.getItem('token')) return true;
  return router.navigate(['/login']);
};
