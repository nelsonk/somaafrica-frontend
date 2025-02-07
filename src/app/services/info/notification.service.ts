import { Injectable } from '@angular/core';
import { NotifyComponent } from '../../commons/notify/notify.component';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // private notifyComponent!: NotifyComponent;
  notifySubject = new Subject<{title: string; message: string; type: 'success' | 'error' | 'info'}>();
  notify$ = this.notifySubject.asObservable();

  constructor() { }

  // register(notifyComponent: NotifyComponent){
  //   this.notifyComponent = notifyComponent;
  // }

  showNotification(
    title: string = 'Notification',
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ){
    // if(this.notifyComponent){
    //   this.notifyComponent.showNotification(title, message, type);
    // }else{
    //   console.error('NotifyComponent is not registered with the NotificationService.');
    // }
    this.notifySubject.next({title, message, type});
  }
}
