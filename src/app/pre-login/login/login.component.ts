import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../services/auth/auth-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers:[AuthService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  loginForm!: FormGroup;
  data!: {}
  constructor(private fb: FormBuilder, private router: Router, private title: Title, private authService: AuthService){
    title.setTitle("SomaAfrica - Login");
  }

//   loginForm = new FormGroup({
//     username: new FormControl('', Validators.required),
//     password: new FormControl('', Validators.required)
// })

ngOnInit(): void {
  this.loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.minLength(8), Validators.required]]
  });
}

onSubmit(): void {
  this.data = {
    "username": this.loginForm.get('username')?.value,
    "password": this.loginForm.get('password')?.value
  }
  this.authService.login(this.data).subscribe(
    (response) => {
      console.log(response);
    }
  );
  console.log("sumitted ", this.loginForm.value);

}

navigateToPage(page: string){
  this.router.navigate([`/${page}`], {queryParams: {source: 'login'}});
}

}
