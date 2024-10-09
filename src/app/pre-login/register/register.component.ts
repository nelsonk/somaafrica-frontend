import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{
  registerForm!: FormGroup
  usernameEmailRequired: boolean = false
  emailInvalid: boolean = false
  passwordRequired: boolean = false
  passwordMinLength: boolean = false
  passwordMismatch: boolean = false

  constructor(private router: Router, title: Title, private fb: FormBuilder) {
    title.setTitle("SomaAfrica - Register");
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', ],
      email: ['', Validators.email],
      password1: ['', [Validators.minLength(8), Validators.required]],
      password2: ['', [Validators.minLength(8), Validators.required]]
    });

    this.registerForm.valueChanges.subscribe(()=> {
      this.displayAlerts()
    })
  }

  displayAlerts(){
    let username = this.registerForm.get("username")
    let email = this.registerForm.get("email")
    let password1 = this.registerForm.get("password1")
    let password2 = this.registerForm.get("password2")

    this.usernameEmailRequired = !username?.value && !email?.value
    this.emailInvalid = !!email?.invalid && !!email
    this.passwordRequired = !!password1?.hasError('required')
    this.passwordMinLength = !!password1?.hasError('minlength')
    this.passwordMismatch = !(password1?.value === password2?.value)

  }

  navigateToPage(page: string){
    this.router.navigate([`/${page}`], {queryParams: {source: "register"}});
  }

  onSubmit(){}

}
