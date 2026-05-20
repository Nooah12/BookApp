import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  darkMode = false;

  constructor() {
    this.darkMode = localStorage.getItem('theme') === 'dark';
    document.documentElement.setAttribute('data-bs-theme', this.darkMode ? 'dark' : 'light');
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    const theme = this.darkMode ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
  }
}
