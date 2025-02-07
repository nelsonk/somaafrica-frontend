import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  modalSubject = new Subject<{
    title: string;
    message: string;
    type: 'success' | 'info' | 'error' | 'warning';
    onConfirm: () => void;
    onCancel?: () => void;
  }>();

  modal$ = this.modalSubject.asObservable();

  confirm(
    title: string,
    message: string,
    type: 'success' | 'info' | 'error' | 'warning',
    onConfirm: () => void,
    onCancel: () => void): void
  {
    this.modalSubject.next({title, message, type, onConfirm, onCancel});
  }

  constructor() { }
}
