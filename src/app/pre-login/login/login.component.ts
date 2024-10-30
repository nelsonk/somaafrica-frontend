import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../services/auth/auth-service.service';
import { catchError, of } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { ApiHealthService } from '../../services/api/api-health.service';

export enum STATUS_TYPE {
  NOT_LOADING = 'NOT_LOADING',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
};

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
  data!: {};
  status: STATUS_TYPE = STATUS_TYPE.NOT_LOADING;
  showPassword: boolean = false;
  faEye = faEye
  faEyeSlash = faEyeSlash
  apiNotHealthy:boolean = true

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private title: Title,
    private authService: AuthService,
    private healthService: ApiHealthService
  ){
    title.setTitle("SomaAfrica - Login");
  }

//   loginForm = new FormGroup({
//     username: new FormControl('', Validators.required),
//     password: new FormControl('', Validators.required)
// })

ngOnInit(): void {
  this.loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required]]
  });

  this.healthService.isHealthy$.pipe(
    catchError(
      (error) => {
        console.log("Error returned: ", error)
        this.apiNotHealthy = true
        return of(false)
      }
    )
  ).subscribe(
    (isHealthy: boolean) => {
      this.apiNotHealthy = !isHealthy;
    }
  );

  console.log(`API not Healthy: ${this.apiNotHealthy}}`)
}

onSubmit(): void {
  this.status = STATUS_TYPE.LOADING;
  let data: {};
  this.data = {
    "username": this.loginForm.get('username')?.value,
    "password": this.loginForm.get('password')?.value
  }
  this.authService.login(this.data).pipe(
    catchError(
      (error) => {
        this.status = STATUS_TYPE.ERROR
        return of({})
      }
    )
  ).subscribe(
    (response) => {
      this.status = STATUS_TYPE.SUCCESS
      console.log(response);
    }
  );
  console.log("sumitted ", this.loginForm.value);

}

navigateToPage(page?: string){
  this.router.navigate([`/${page}`], {queryParams: {source: 'login'}});
}

}
