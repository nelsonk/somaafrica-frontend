import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../services/auth/auth-service.service';
import { catchError, of } from 'rxjs';

export enum STATUS_TYPE {
  NOT_LOADING = 'NOT_LOADING',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  providers:[AuthService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  loginForm!: FormGroup;
  data!: {};
  status: STATUS_TYPE = STATUS_TYPE.NOT_LOADING;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private title: Title,
    private authService: AuthService
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
}

onSubmit(): void {
  this.status = STATUS_TYPE.LOADING
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
