import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service.service';
import { EmailValidator, FormBuilder, FormGroup, ReactiveFormsModule, RequiredValidator, Validators } from '@angular/forms';
import { ApiHealthService } from '../../services/api/api-health.service';
import { catchError, of} from 'rxjs';
import { STATUS_TYPE } from '../../utils/status-type';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/info/notification.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit{
  forgotPasswordForm!: FormGroup;
  apiNotHealthy: boolean = true;
  emailRequired: boolean = false;
  emailInvalid: boolean = false;
  status: STATUS_TYPE = STATUS_TYPE.NOT_LOADING;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private apiHealthService: ApiHealthService,
    private notificationService: NotificationService,
    title: Title
  ){
    title.setTitle("SomaAfrica - Forgot Password");
  }

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]]
    });

    this.forgotPasswordForm.valueChanges.subscribe(() =>{
      this.displayAlerts();
    })

    this.apiHealthService.isHealthy$.subscribe(
      (apiHealthy: boolean) => {
        this.apiNotHealthy = !apiHealthy;
      }
    );

  }

  displayAlerts(){
    let email = this.forgotPasswordForm.get('email');

    this.emailRequired = !!email?.hasError('required');
    this.emailInvalid = !!email?.invalid;
  }

  onSubmit(){
    this.status = STATUS_TYPE.LOADING;
    let data = {
      email: this.forgotPasswordForm.get('email')?.value
    }

    this.authService.requestPasswordReset(data).subscribe(
      (response) => {
        if (response.status != STATUS_TYPE.ERROR){
          this.status = STATUS_TYPE.SUCCESS;
          this.notificationService.showNotification('Success', response.detail, 'success');
        }else{
          this.status = STATUS_TYPE.ERROR;
          this.notificationService.showNotification('Error', response.detail, 'error');
        }
      }
    )
  }

}
