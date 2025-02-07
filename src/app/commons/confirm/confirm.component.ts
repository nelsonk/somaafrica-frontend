import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { ConfirmationService } from '../../services/info/confirmation.service';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.css'
})
export class ConfirmComponent implements OnInit{
  isVisible: boolean = false;
  title: string = '';
  message: string = '';
  type: 'success' | 'error' | 'info' | 'warning' = 'info';

  private onConfirmCallback: () => void = () => {};
  private onCancelCallback: () => void = () => {};

  constructor(private confirmationService: ConfirmationService){}

  ngOnInit(): void {
    this.confirmationService.modal$.subscribe((modalData) => {
        this.title = modalData.title;
        this.message = modalData.message;
        this.type = modalData.type;
        this.onConfirmCallback = modalData.onConfirm;
        this.onCancelCallback = modalData.onCancel || (() => {});
        this.isVisible = true;
    });
  }

  onConfirm(){
    this.onConfirmCallback();
    this.isVisible = false;
  }

  onCancel(){
    this.onCancelCallback();
    this.isVisible = false;
  }
}
