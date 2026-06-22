import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = false;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.initializeTheme();
  }

  private initializeTheme() {
    // Vérifier les préférences sauvegardées ou celles du système
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode = prefersDark;
    }
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkMode) {
      this.document.documentElement.classList.add('dark', 'ion-palette-dark');
    } else {
      this.document.documentElement.classList.remove('dark', 'ion-palette-dark');
    }
  }

  get isDark(): boolean {
    return this.isDarkMode;
  }
}
