import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import { FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { ApiHealthService } from '../../services/api/api-health.service';
import { catchError, of } from 'rxjs';
import { STATUS_TYPE } from '../../utils/status-type';
import { AuthService } from '../../services/auth/auth-service.service';
import { SessionStorageService } from '../../services/storage/session-storage.service';
import { ConfirmationService } from '../../services/info/confirmation.service';
import { NotificationService } from '../../services/info/notification.service';
import { checkPasswordMatch } from '../../utils/password-match';

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
  apiNotHealthy:boolean = true;
  STATUS_TYPE = STATUS_TYPE;
  status: STATUS_TYPE = STATUS_TYPE.NOT_LOADING;
  errorMessage: string = "";

  constructor(
    private router: Router,
    title: Title,
    private fb: FormBuilder,
    private healthService: ApiHealthService,
    private authService: AuthService,
    private sessionStorage: SessionStorageService,
    private confirmationService: ConfirmationService,
    private notificationService: NotificationService
  ) {
    title.setTitle("SomaAfrica - Register");

    if (this.sessionStorage.getItem("isAuthenticated")){
      this.authService.navigateToPage("user/profile", "register");
    }
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

    this.healthService.isHealthy$.subscribe(
      (apiHealthy: boolean) => {
        this.apiNotHealthy = !apiHealthy;
      }
    );
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
    this.passwordMismatch = !checkPasswordMatch(password1?.value, password2?.value)

  }

  navigateToPage(page: string){
    this.router.navigate([`/${page}`], {queryParams: {source: "register"}});
  }

  onSubmit(){
    this.status = STATUS_TYPE.LOADING;
    let data = {
      "username": this.registerForm.get('username')?.value,
      "email": this.registerForm.get('email')?.value,
      "password1": this.registerForm.get('password1')?.value,
      "password2": this.registerForm.get('password2')?.value
    }

    this.authService.register(data)
    .subscribe(
      (response) => {
        if (response.status === STATUS_TYPE.ERROR) {
          this.status = STATUS_TYPE.ERROR;
          this.errorMessage = response.detail;
          this.notificationService.showNotification('Error', this.errorMessage, 'error');
          return;
        }

        this.status = STATUS_TYPE.SUCCESS;
        let login = false;

        this.confirmationService.confirm(
          'Login',
          'Registered, would you like to be logged in?',
          'success',
          () => {
            login = true;
          },
          () => {})


        if(login){
          let loginData = {
            username: data.username? data.username : data.email,
            password: data.password1
          }

          this.authService.login(loginData)
          .subscribe(
            (response) => {
              if (response.status === STATUS_TYPE.ERROR) {
                this.status = STATUS_TYPE.ERROR;
                this.errorMessage = response.detail;
                return;
              }

              this.status = STATUS_TYPE.SUCCESS;
              this.authService.navigateToPage("user/profile", "register");
            }
          );
        }else{
          this.sessionStorage.clearEntireSession();
          this.authService.navigateToPage("/", "register");
        }

      }
    );
  }

}
