import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth-service.service';
import { NotificationService } from '../../services/info/notification.service';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { STATUS_TYPE } from '../../utils/status-type';
import { ApiHealthService } from '../../services/api/api-health.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { checkPasswordMatch } from '../../utils/password-match';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit{
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  status:STATUS_TYPE = STATUS_TYPE.NOT_LOADING;
  showPassword2: boolean = false;
  showPassword: boolean = false;
  apiNotHealthy: boolean = true;
  passwordMismatch: boolean = false;
  passwordRequired: boolean = false;
  passwordMinLength: boolean = false;
  resetPasswordForm!: FormGroup;
  guid: string = "";
  token: string = "";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private apiHealthService: ApiHealthService,
    title: Title,
    private route: ActivatedRoute
  ){
    title.setTitle("SomaAfrica - Reset Password");
  }

  ngOnInit(): void {
    this.resetPasswordForm = this.fb.group({
      password1: ["", [Validators.required, Validators.minLength(8)]],
      password2: ["", [Validators.required, Validators.minLength(8)]]
    });

    this.resetPasswordForm.valueChanges.subscribe(() => {
      this.displayAlerts();
    })

    this.apiHealthService.isHealthy$.subscribe(
      (apiHealthy: boolean) => {
        this.apiNotHealthy = !apiHealthy;
      }
    );

    this.guid = this.route.snapshot.paramMap.get("guid")!;
    this.token = this.route.snapshot.paramMap.get("token")!;
  }

  displayAlerts(){
    let password = this.resetPasswordForm.get("password1");
    let password2 = this.resetPasswordForm.get("password2");

    this.passwordRequired = !!password?.hasError("required");
    this.passwordMinLength = !!password?.hasError("minlength");
    this.passwordMismatch = !checkPasswordMatch(password?.value, password2?.value);
  }

  onSubmit(){
    this.status = STATUS_TYPE.LOADING;
    let data = {
      password1: this.resetPasswordForm.get("password1")?.value,
      password2: this.resetPasswordForm.get("password2")?.value
    }

    this.authService.resetPassword(this.guid, this.token, data).subscribe(
      (response) => {
        if (response.status !== STATUS_TYPE.ERROR) {
          this.status = STATUS_TYPE.SUCCESS
          this.notificationService.showNotification("Success", "Password reset successfully", "success");
        }else{
          this.status = STATUS_TYPE.ERROR
          this.notificationService.showNotification("Error", response.detail, "error");
        }
      }
    )
  }
}
