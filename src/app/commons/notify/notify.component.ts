import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/info/notification.service';

@Component({
  selector: 'app-notify',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notify.component.html',
  styleUrl: './notify.component.css'
})
export class NotifyComponent implements OnInit{
  message: string = '';
  title: string = 'Notification';
  type: 'success' | 'error' | 'info' = 'info';
  isVisible: boolean = false;

  constructor(private notificationService: NotificationService){}

  ngOnInit(): void {
    this.notificationService.notify$.subscribe((data) => {
      if(data){
        this.title = data.title;
        this.message = data.message;
        this.type = data.type;

        this.message = this.message.trim();
        if (this.message){
          this.isVisible = true;

          if (this.type === 'success'){
            setTimeout(() => this.isVisible = false, 30000);
          }
        }
      }
    })
  }

  closeNotification(){
    this.isVisible = false;
  }
}
