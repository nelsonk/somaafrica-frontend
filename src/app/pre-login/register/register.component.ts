import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { ApiHealthService } from '../../services/api/api-health.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FontAwesomeModule],
  providers: [ApiHealthService],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{
  registerForm!: FormGroup;
  usernameEmailRequired: boolean = false;
  emailInvalid: boolean = false;
  passwordRequired: boolean = false;
  passwordMinLength: boolean = false;
  passwordMismatch: boolean = false;
  showPassword: boolean = false;
  showPassword2: boolean = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  apiNotHealthy:boolean = true

  constructor(
    private router: Router,
    title: Title,
    private fb: FormBuilder,
    private healthService: ApiHealthService
  ) {
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

  displayAlerts(){
    let username = this.registerForm.get("username")
    let email = this.registerForm.get("email")
    let password1 = this.registerForm.get("password1")
    let password2 = this.registerForm.get("password2")

    this.usernameEmailRequired = !username?.value && !email?.value
    this.emailInvalid = !!email?.invalid && !!email
    this.passwordRequired = !!password1?.hasError('required')
    this.passwordMinLength = !!password1?.hasError('minlength')
    this.passwordMismatch = !this.checkPasswordMatch(password1?.value, password2?.value)

  }

  checkPasswordMatch(password1: string, password2: string){
    console.log(`password1 - ${password1}`)
    console.log(`password2 - ${password2}`)
    const passwordsMatch = password1 === password2
    console.log(passwordsMatch)
    return passwordsMatch
  }

  navigateToPage(page: string){
    this.router.navigate([`/${page}`], {queryParams: {source: "register"}});
  }

  onSubmit(){}

}
