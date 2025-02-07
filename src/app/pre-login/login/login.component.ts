import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../services/auth/auth-service.service';
import { catchError, of } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { ApiHealthService } from '../../services/api/api-health.service';
import { SessionStorageService } from '../../services/storage/session-storage.service';
import { STATUS_TYPE } from '../../utils/status-type';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, FontAwesomeModule],
  providers:[AuthService, ApiHealthService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  loginForm!: FormGroup;
  STATUS_TYPE = STATUS_TYPE
  status: STATUS_TYPE = STATUS_TYPE.NOT_LOADING;
  showPassword: boolean = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  apiNotHealthy:boolean = true;
  errorMessage: string = "";

  constructor(
    private fb: FormBuilder,
    private title: Title,
    private authService: AuthService,
    private healthService: ApiHealthService,
    private sessionStorage: SessionStorageService
  ){
    this.title.setTitle("SomaAfrica - Login");

    if (this.sessionStorage.getItem("isAuthenticated")){
      this.authService.navigateToPage("user/profile", "login");
    }
  }

ngOnInit(): void {
  this.loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required]]
  });

  this.healthService.isHealthy$.subscribe(
    (apiHealthy: boolean) => {
      this.apiNotHealthy = !apiHealthy;
    }
  );
}

onSubmit(): void {
  this.status = STATUS_TYPE.LOADING;
  let data: {};
  data = {
    "username": this.loginForm.get('username')?.value,
    "password": this.loginForm.get('password')?.value
  }

  this.authService.login(data)
  .subscribe(
    (response) => {
      if (response.status === STATUS_TYPE.ERROR) {
        this.status = STATUS_TYPE.ERROR;
        this.errorMessage = response.detail;
        return;
      }

      this.status = STATUS_TYPE.SUCCESS;
      this.authService.navigateToPage("user/profile", "login");
    }
  );

}

}
