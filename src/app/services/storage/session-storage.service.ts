import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  constructor() { }

  getItem(key: string): any {
    try {
      const item = sessionStorage.getItem(key);

      if (!item || item === "undefined") {
        return null;
      }
      
      return JSON.parse(item);
    } catch (error) {
      console.error('Error parsing sessionStorage item:', error);
      return null;
    }
  }

  setItem(key: string, value: any): void {
    try {
      if (key === undefined || key === null) {
        console.warn('Attempted to store a value with an undefined or null key. Operation skipped.');
        return;
      }

      if (value === undefined) {
        console.warn(`Attempted to store an undefined value for key "${key}". Operation skipped.`);
        return;
      }

      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving sessionStorage item with key "${key}":`, error);
    }
  }

  removeItem(key: string): void {
    try {
      if (key === undefined || key === null) {
        console.warn('Attempted to remove a value with an undefined or null key. Operation skipped.');
        return;
      }

      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing sessionStorage item with key "${key}":`, error);
    }
  }

  clearEntireSession(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing session storage:', error);
    }
  }
}
