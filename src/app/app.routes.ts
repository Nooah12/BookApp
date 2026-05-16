import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Books } from './components/books/books';
import { BookForm } from './components/book-form/book-form';
import { Quotes } from './components/quotes/quotes';
import { authGuard } from './services/auth';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'books', component: Books, canActivate: [authGuard] },
  { path: 'books/new', component: BookForm, canActivate: [authGuard] },
  { path: 'books/edit/:id', component: BookForm, canActivate: [authGuard] },
  { path: 'quotes', component: Quotes, canActivate: [authGuard] }
];
