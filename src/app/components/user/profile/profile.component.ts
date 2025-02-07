import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReusableCardComponent } from '../../../commons/reusable-card/reusable-card.component';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { AuthService } from '../../../services/auth/auth-service.service';
import { Person } from '../../../models/person.interface';
import { User } from '../../../models/user.interface';
import { SessionStorageService } from '../../../services/storage/session-storage.service';
import { STATUS_TYPE } from '../../../utils/status-type';
import { ApiHealthService } from '../../../services/api/api-health.service';
import { faEye, faEyeSlash, faUser } from '@fortawesome/free-solid-svg-icons';
import { forkJoin } from 'rxjs';
import { NotificationService } from '../../../services/info/notification.service';
import { ConfirmationService } from '../../../services/info/confirmation.service';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReusableCardComponent, CommonModule, FontAwesomeModule, ReactiveFormsModule, FormsModule, NgForOf],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  apiNotHealthy:boolean = true;
  fetchedFromApi = false;
  errorMessage: string = "";
  phoneError:string = "";
  addressError:string = "";
  personError:string = "";
  userError:string = "";
  passwordMismatch: boolean = false;
  passwordRequired: boolean = false;
  currentRequired: boolean = false;
  passwordMinLength: boolean = false;
  showCurrent: boolean = false;
  showPassword: boolean = false;
  showPassword2: boolean = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faUser = faUser;
  STATUS_TYPE = STATUS_TYPE;
  status: STATUS_TYPE = STATUS_TYPE.NOT_LOADING;
  activeLink: number | null = 0;

  person: Person = {
    account_status: '',
    address: [],
    created_at: '',
    created_by: '',
    date_of_birth: '',
    first_name: '',
    gender: '',
    guid: '',
    last_name: '',
    phone: [],
    updated_at: '',
    updated_by: '',
    user: {
      username: 'None',
      email: 'None',
      guid: '',
      is_active: false,
      is_superuser: false,
      last_login: '',
  },
  };

  phoneNumbers = "";
  addresses = "";

  user: User = {
    username: 'None',
    email: 'None',
    guid: '',
    is_active: false,
    is_superuser: false,
    last_login: '',
  }

  password = {
    current: '',
    password1: '',
    password2: ''
  }

  passwordForm!: FormGroup;

  @ViewChild('collapseAboutMe') collapseAboutMe!: ElementRef;

  links = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      dataToggle: 'collapse',
      href: '#dashboardlist',
      controls: 'dashboardlist',
      subItems: ['All', 'Performance', 'Payments'],
      subItemsHref: ['#', '#', '#'],
    },
    {
      id: 'student',
      label: 'Students',
      dataToggle: 'collapse',
      href: '#studentlist',
      controls: 'studentlist',
      subItems: ['All', 'Performance', 'Payments'],
      subItemsHref: ['#', '#', '#'],
    },
    {
      id: 'school',
      label: 'Schools',
      dataToggle: 'collapse',
      href: '#schoollist',
      controls: 'schoollist',
      subItems: ['All', 'Performance', 'Payments'],
      subItemsHref: ['#', '#', '#'],
    },
    {
      id: 'teacher',
      label: 'Teachers',
      dataToggle: 'collapse',
      href: '#teacherlist',
      controls: 'teacherlist',
      subItems: ['All', 'Performance', 'Payments'],
      subItemsHref: ['#', '#', '#'],
    },
    {
      id: 'agent',
      label: 'SomaAfrica Agents',
      dataToggle: 'collapse',
      href: '#agentlist',
      controls: 'agentlist',
      subItems: ['All', 'Performance', 'Payments'],
      subItemsHref: ['#', '#', '#'],
    },
    {
      id: 'admin',
      label: 'SomaAfrica Admins',
      dataToggle: 'collapse',
      href: '#adminlist',
      controls: 'adminlist',
      subItems: ['All', 'Performance', 'Payments'],
      subItemsHref: ['#', '#', '#'],
    },
  ];

  cardData = {
    title: 'Recommended just for you!',
    description: '',
    items: [
      { image: 'img/logo.png', title: 'Coaching & Quizzes', desc: 'Looking for coaching or Quizzes, we have a teacher near you & the best prepared Quizzes', link: '/register' },
      { image: 'img/logo.png', title: 'Online Admissions', desc: 'Applying into any school has never been easier & you even get to track progress till admission', link: '/login' },
      { image: 'img/logo.png', title: 'Learning Materials', desc: 'Explore thousands of written and video materials from the best schools and teachers', link: '#' },
      { image: 'img/logo.png', title: 'Learning Materials', desc: 'Explore thousands of written and video materials from the best schools and teachers', link: '/' }
    ]
  };


  constructor(
    private auth: AuthService,
    private sessionStorage: SessionStorageService,
    private apiHealth: ApiHealthService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private renderer: Renderer2,
    private el: ElementRef,
    title: Title
  ) {
    title.setTitle("SomaAfrica - Profile");

    try {
      this.user = this.sessionStorage.getItem("User");
    } catch (error) {
      console.log("Error getting user from session storage: ", error);
    }
  }

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      current: ['', [Validators.minLength(8), Validators.required]],
      password1: ['', [Validators.minLength(8), Validators.required]],
      password2: ['', [Validators.minLength(8), Validators.required]]
    });

    this.passwordForm.valueChanges.subscribe(()=> {
      this.password.current = this.passwordForm.get("current")?.value;
      this.password.password1 = this.passwordForm.get("password1")?.value;
      this.password.password2 = this.passwordForm.get("password2")?.value;
      this.displayAlerts();
    })

    this.apiHealth.isHealthy$.subscribe(
      (isHealthy: boolean) => {
        this.apiNotHealthy = !isHealthy;

        if (isHealthy){
          this.status = STATUS_TYPE.SUCCESS;

          if(!this.fetchedFromApi){
            if(this.getPerson()){
              this.fetchedFromApi = true;
            }
          }
        }else{
          if (this.person.guid){
            return;
          }

          try {
            const person_local = this.sessionStorage.getItem("Person");

            if(person_local){
              // Only assign if not empty to avoid overriding with empty
              this.person = person_local;
            }
          } catch (error) {
            console.log("Error getting person from session storage: ", error)
          }
        }
      }
    );
  }

  // ngAfterViewInit(){
  //   this.notificationService.register(this.notification);
  // }

  displayAlerts(){
    let password1 = this.passwordForm.get("password1");
    let password2 = this.passwordForm.get("password2");
    let current = this.passwordForm.get("current");

    this.currentRequired = !!current?.hasError('required');
    this.passwordRequired = !!password1?.hasError('required');
    this.passwordMinLength = !!(password1?.hasError('minlength') || current?.hasError('minlength'));
    this.passwordMismatch = !this.checkPasswordMatch(password1?.value, password2?.value);
  }

  checkPasswordMatch(password1: string, password2: string){
    const passwordsMatch = password1 === password2;
    return passwordsMatch;
  }

  setActiveLink(index: number): void {
    this.activeLink = this.activeLink === index ? null : index;
  }

  openAccordion(): void {
    const accordionElement = document.getElementById('collapseAboutMe');

    if (accordionElement) {
      accordionElement.classList.add('show');

      // Listen for Bootstrap's shown.bs.collapse event
      accordionElement.addEventListener('shown.bs.collapse', () => {
        this.collapseAboutMe.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      // If the collapse is already open, trigger scroll directly
      if (accordionElement.classList.contains('show')) {
        this.collapseAboutMe.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  openModal(modalId: string) {
    const modal = this.el.nativeElement.querySelector(`#${modalId}`);
    if (modal) {
        this.renderer.removeAttribute(modal, 'aria-hidden');
        this.renderer.removeAttribute(modal, 'inert');
    }
  }

  closeModal(modalId: string) {
    const modal = this.el.nativeElement.querySelector(`#${modalId}`);
    if (modal) {
        this.renderer.setAttribute(modal, 'aria-hidden', 'true');
        this.renderer.setAttribute(modal, 'inert', '');
    }
  }


  logout(){
    this.auth.logout();
  }

  updatePassword(){
    this.confirmationService.confirm(
      'Password Update',
      'Are you sure you want to change the password?',
      'error',
      this.changePassword.bind(this),
      () => {}
    );
  }

  changePassword(){
    let filter: {} = {};

    if(this.user.username){
      filter = {
        username: this.user.username
      }
    }else if(this.user.email){
      filter = {
        username: this.user.email
      }
    }else{
      return this.notificationService.showNotification(
        "Error",
        "Both username and email empty, first set them on your profile",
        "error"
      )
    }

    this.password = Object.assign(filter, this.password);

    this.auth.changePassword(this.user.guid, this.password).subscribe(
      (response) => {
        if (response.status != STATUS_TYPE.ERROR){
          this.status = STATUS_TYPE.SUCCESS;
          this.errorMessage = "";
          this.notificationService.showNotification(
            'Success',
            "Password updated successfully",
            'success'
          );
        }else{
          this.status = STATUS_TYPE.ERROR;
          this.errorMessage = response.detail;

          if(this.errorMessage == "Invalid password"){
            this.errorMessage = "Current password incorrect";
          }

          this.notificationService.showNotification(
            'Error',
            this.errorMessage,
            'error'
          );
        }
      }
    );
  }

  addUser(person_guid: string){
    const data = {
      user_guid: this.user.guid
    }

    this.auth.addUserToPerson(person_guid, data).subscribe(
      (response) => {
        if (response.status != STATUS_TYPE.ERROR){
          this.status = STATUS_TYPE.SUCCESS;
          this.userError = "";
          this.notificationService.showNotification('Success', "Person created successfully", 'success');
          this.getPerson();
        }else{
          this.status = STATUS_TYPE.ERROR;
          this.userError = response.detail;
          this.notificationService.showNotification('Error', this.userError, 'error');
        }
      }
    );
  }

  saveUser(){
    if (this.user){
      this.auth.updateUser(this.user.guid, this.user).subscribe(
        (response) => {
          if (response.status != STATUS_TYPE.ERROR){
            this.status = STATUS_TYPE.SUCCESS;
            this.userError = "";
            this.notificationService.showNotification('Success', 'User saved successfully', 'success');
          }else{
            this.status = STATUS_TYPE.ERROR;
            this.userError = response.detail;
            this.notificationService.showNotification('Error', this.userError, 'error');
          }
        }
      );
    }
  }

  getPerson(): boolean{
    let returnValue: boolean = false;
    this.auth.getPerson().subscribe(
      (response) => {
        if (response.status != STATUS_TYPE.ERROR){
          this.status = STATUS_TYPE.SUCCESS;
          this.personError = "";
          this.person = response[0];
          returnValue = true;
        }else{
          this.status = STATUS_TYPE.ERROR;
          this.personError = response.error;
          this.notificationService.showNotification('Error', this.personError, 'error');
          returnValue = false;
        }
      }
    );

    return returnValue;
  }

  savePerson(){
    // Create a new object without `user`, `phone`, and `address`
    const { user, phone, address, ...personCopy } = this.person;

    this.auth.updatePerson(this.person.guid, personCopy).subscribe(
      (response) => {
        if (response.status != STATUS_TYPE.ERROR){
          this.status = STATUS_TYPE.SUCCESS;
          this.personError = "";
          this.notificationService.showNotification('Success', 'Person saved successfully', 'success');
        }else{
          this.status = STATUS_TYPE.ERROR;
          this.personError = response.detail;
          this.notificationService.showNotification('Error', this.personError, 'error');
        }
      }
    );
  }

  addPerson(){
    this.person.created_by = this.user.guid;
    this.person.updated_by = this.user.guid;
    this.person.account_status = "Incomplete";

    // Create a new object without `user`, `phone`, and `address`
    const { user, phone, address, ...personCopy } = this.person;

    this.auth.createPerson(personCopy).subscribe(
      (response) => {
        if (response.status != STATUS_TYPE.ERROR) {
          this.status = STATUS_TYPE.SUCCESS;
          this.personError = "";
          this.addUser(response.guid);
        }else{
          this.status = STATUS_TYPE.ERROR;
          this.personError = response.detail;
          this.notificationService.showNotification('Error', this.personError, 'error');
        }
      }
    );
  }

  savePhone(){
    // Convert the string into an array of phone objects
    const phoneNumbersArray = this.phoneNumbers
    .split(';')
    .map(number => number.trim())
    .filter(number => number); // Remove empty strings
    let phone = this.person.phone;
    const apiCalls = [];

    if (phoneNumbersArray.length > 0 && this.person.guid){
      for (let i=0; i < phoneNumbersArray.length; i++){
        phone.push({
          number: phoneNumbersArray[i],
          updated_by: this.user.guid,
          created_by: this.user.guid
        });
      }
    }

    if(phone.length > 0){
      for (let i=0; i < phone.length; i++){
        if (!phone[i].number && phone[i].guid){
          apiCalls.push(this.auth.removePhone(this.person.guid, phone[i]));
          continue;
        }

        if(phone[i].guid){
          phone[i].updated_by = this.user.guid;
          apiCalls.push(this.auth.updatePhone(phone[i].guid, phone[i]));
        }else{
          apiCalls.push(this.auth.addPhone(this.person.guid, phone[i]));
        }
      }

      // Combine all API calls and handle responses
      forkJoin(apiCalls).subscribe((responses) => {
        let forkErrors: any[] = [];

        responses.forEach((response, index) => {
          if (response.status !== STATUS_TYPE.ERROR) {
            this.status = STATUS_TYPE.SUCCESS;
            this.phoneError = "";
          } else {
            forkErrors.push(response);
          }
        });

        if (forkErrors.length > 0) {
          this.status = STATUS_TYPE.ERROR;
          this.phoneError = "";

          for (const error of forkErrors) {
            if (typeof error === "object" && error !== null) {
              // Iterate through key-value pairs if error is an object
              for (const [key, value] of Object.entries(error)) {
                this.phoneError += `${key}: ${value}\n`;
              }

              this.phoneError += "\n";
            } else if (typeof error === "string" && error.trim() !== "") {
              // If error is a string, add it directly
              this.phoneError += `${error}\n`;
            }
          }

          this.notificationService.showNotification('Error', this.phoneError, 'error');
        }else{
          this.notificationService.showNotification('Success', 'Phone/s added/modified successfully', 'success');

          // Reset new numbers only if all successfully added.
          this.phoneNumbers = "";
        }

        // Refresh data after all operations are complete
        this.getPerson();
      });
    }
  }

  saveAddress(){
    // Convert the string into an array of phone objects
    const AddressesArray = this.addresses
    .split(';')
    .map(address => address.trim())
    .filter(address => address); // Remove empty strings
    let address = this.person.address;
    const apiCalls = [];

    if (AddressesArray.length > 0 && this.person.guid){
      for (let i=0; i < AddressesArray.length; i++){
        address.push({
          address: AddressesArray[i],
          updated_by: this.user.guid,
          created_by: this.user.guid
        });
      }
    }

    if(address.length > 0){
      for (let i=0; i < address.length; i++){
        if (!address[i].address && address[i].guid){
          apiCalls.push(this.auth.removeAddress(this.person.guid, address[i]));
          continue;
        }

        if(address[i].guid){
          address[i].updated_by = this.user.guid;
          apiCalls.push(this.auth.updateAddress(address[i].guid, address[i]));
        }else{
          apiCalls.push(this.auth.addAddress(this.person.guid, address[i]));
        }
      }

      // Combine all API calls and handle responses
      forkJoin(apiCalls).subscribe((responses) => {
        let forkErrors: any[] = [];

        responses.forEach((response, index) => {
          if (response.status !== STATUS_TYPE.ERROR) {
            this.status = STATUS_TYPE.SUCCESS;
            this.addressError = "";
          } else {
            forkErrors.push(response);
          }
        });

        if (forkErrors.length > 0) {
          this.status = STATUS_TYPE.ERROR;
          this.addressError = "";

          for (const error of forkErrors) {
            if (typeof error === "object" && error !== null) {
              // Iterate through key-value pairs if error is an object
              for (const [key, value] of Object.entries(error)) {
                this.addressError += `${key}: ${value}\n`;
              }

              this.addressError += "\n";
            } else if (typeof error === "string" && error.trim() !== "") {
              // If error is a string, add it directly
              this.addressError += `${error}\n`;
            }
          }

          this.notificationService.showNotification('Error', this.addressError, 'error');
        }else{
          this.notificationService.showNotification('Success', 'Address/es added/modified successfully', 'success');

          // reset new addresses only if all successfully added
          this.addresses = "";
        }

        // Refresh data after all operations are complete
        this.getPerson();
      });
    }
  }

}
