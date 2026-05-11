import { Component, OnInit, ElementRef, ViewChild, Renderer2, Input} from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, forkJoin } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash, faUser } from '@fortawesome/free-solid-svg-icons';
import { ReusableCardComponent } from '../../../commons/reusable-card/reusable-card.component';
import { ApiHealthService } from '../../../services/api/api-health.service';
import { AuthService } from '../../../services/auth/auth-service.service';
import { ConfirmationService } from '../../../services/info/confirmation.service';
import { NotificationService } from '../../../services/info/notification.service';
import { SessionStorageService } from '../../../services/storage/session-storage.service';
import { CardData, DEFAULT_CARD_DATA } from '../../../models/card.interface';
import { Person, DEFAULT_PERSON } from '../../../models/person.interface';
import { SidebarLink, SIDEBAR_LINKS } from '../../../models/sidebar.interface';
import { User, DEFAULT_USER } from '../../../models/user.interface';
import { STATUS_TYPE } from '../../../utils/status-type';
import { NavigationService } from '../../../services/navigation/navigation.service';

declare var bootstrap: any;


@Component({
    selector: 'app-profile',
    imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule, FormsModule, NgForOf, RouterLink],
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
  activeLink: number | null = null;
  activeSubIndices: { [key: number]: number } = {};
  currentSource!: string;
  previousUrl!: string; // Store the immediate previous URL
  note: string = "";

  person: Person = { ...DEFAULT_PERSON };

  phoneNumbers = "";
  addresses = "";

  user: User = { ...DEFAULT_USER };

  password = {
    password: '',
    password1: '',
    password2: ''
  }

  passwordForm!: FormGroup;

  @ViewChild('collapseAboutMe') collapseAboutMe!: ElementRef;

  links:SidebarLink[] = SIDEBAR_LINKS;

  cardData: CardData = { ...DEFAULT_CARD_DATA };


  constructor(
    private auth: AuthService,
    private sessionStorage: SessionStorageService,
    private apiHealth: ApiHealthService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    title: Title,
    private navInterceptor: NavigationService
  ) {
    title.setTitle("SomaAfrica - Profile");
    this.note = "Earn 45% for 2 years as a SomaAfrica agent for each school you sign, learn more.";

    try {
      this.user = this.sessionStorage.getItem("User");
    } catch (error) {
      console.log("Error getting user from session storage: ", error);
    }
  }

  ngOnInit(): void {
    // Update active link on navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.highlightActiveLink(event.urlAfterRedirects);
      });

    // Handle initial load
    this.highlightActiveLink(this.router.url);

    this.passwordForm = this.fb.group({
      current: ['', [Validators.minLength(8), Validators.required]],
      password1: ['', [Validators.minLength(8), Validators.required]],
      password2: ['', [Validators.minLength(8), Validators.required]]
    });

    this.passwordForm.valueChanges.subscribe(()=> {
      this.password.password = this.passwordForm.get("current")?.value;
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
            this.getPerson()
          }
        }else{
          if (this.person?.guid){
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

  highlightActiveLink(currentUrl: string): void {
    const path = currentUrl.split('?')[0];
    let longestMatchLength = -1;
    let bestLinkIndex: number | null = null;
    let bestSubIndex: number | null = null;

    this.links.forEach((link, linkIndex) => {
      // Match main link
      if (
        path === link.href ||
        path.startsWith(link.href + '/') ||
        path === link.href + '/'
      ) {
        if (link.href.length > longestMatchLength) {
          longestMatchLength = link.href.length;
          bestLinkIndex = linkIndex;
          bestSubIndex = null;
        }
      }

      // Match sub-items
      link.subItemsHref.forEach((subHref, subIndex) => {
        if (
          path === subHref ||
          path.startsWith(subHref + '/') ||
          path === subHref + '/'
        ) {
          if (subHref.length >= longestMatchLength) {
            longestMatchLength = subHref.length;
            bestLinkIndex = linkIndex;
            bestSubIndex = subIndex;
          }
        }
      });
    });

    // Set active parent and subitem
    this.activeLink = bestLinkIndex;
    this.activeSubIndices = {};

    if (bestLinkIndex !== null && bestSubIndex !== null) {
      this.activeSubIndices[bestLinkIndex] = bestSubIndex;
    }
  }

  setActiveLink(index: number): void {
    if (this.activeLink === index) {
      this.activeLink = null;
      delete this.activeSubIndices[index];
    } else {
      this.activeLink = index;
    }
  }

  setActiveSubLink(linkIndex: number, subLinkIndex: number): void {
    if (this.activeSubIndices[linkIndex] === subLinkIndex) {
      delete this.activeSubIndices[linkIndex];
    } else {
      this.activeSubIndices[linkIndex] = subLinkIndex;
    }
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

  openModal(modalId: string, panelId?: string) {
    const modalElement = document.getElementById(modalId);

    if (modalElement) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

      modal.show();

      if (panelId) {
        setTimeout(() => {
          const panelElement = document.getElementById(panelId);

          if (panelElement) {
            bootstrap.Collapse.getOrCreateInstance(panelElement).show();
          }
        }, 300);
      }
    }
  }

  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);

    if (modalElement) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

      modal.hide();
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
      {
        next: () => {
          this.status = STATUS_TYPE.SUCCESS;
          this.errorMessage = "";
          this.notificationService.showNotification(
            'Success',
            "Password updated successfully",
            'success'
          );
        },
        error: (err) => {
          this.status = STATUS_TYPE.ERROR;
          this.errorMessage = err.error.detail;

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
      {
        next: () => {
          this.status = STATUS_TYPE.SUCCESS;
          this.userError = "";
          this.notificationService.showNotification('Success', "Person created successfully", 'success');
          this.getPerson();
        },
        error: (err) => {
          this.status = STATUS_TYPE.ERROR;
          this.userError = err.error.detail;
          this.notificationService.showNotification('Error', this.userError, 'error');
        }
      }
    );
  }

  saveUser(){
    console.log("Save user: ", this.user)
    if (this.user){
      this.auth.updateUser(this.user.guid, this.user).subscribe(
        {
          next: () => {
            this.status = STATUS_TYPE.SUCCESS;
            this.userError = "";
            this.notificationService.showNotification('Success', 'User saved successfully', 'success');
          },
          error: (err) => {
            this.status = STATUS_TYPE.ERROR;
            this.userError = err.error.detail;
            this.notificationService.showNotification('Error', this.userError, 'error');
          }
        }
      );
    }
  }

  getPerson(){
    let returnValue: boolean = false;
    this.auth.getPerson().subscribe(
      {
        next: (response) => {
          this.status = STATUS_TYPE.SUCCESS;

          if (response.length === 0){
            this.personError = "No person details found";
            this.fetchedFromApi = true;
            this.openModal('profileModal', 'collapseAccount');
            this.notificationService.showNotification(
              'Info',
              'No person found, please fill in details below to create person',
              'info'
            );
          }else{
            this.personError = "";
            this.person = response[0];
            this.fetchedFromApi = true;
          }
        },
        error: (err) => {
          this.status = STATUS_TYPE.ERROR;
          this.personError = err.error.detail;
          this.notificationService.showNotification('Error', this.personError, 'error');
        }
      }
    );

  }

  savePerson(){
    // Create a new object without `user`, `phone`, and `address`
    const { user, phone, address, ...personCopy } = this.person;

    this.auth.updatePerson(this.person.guid ?? '', personCopy).subscribe(
      {
        next: () => {
          this.status = STATUS_TYPE.SUCCESS;
          this.personError = "";
          this.notificationService.showNotification('Success', 'Person saved successfully', 'success');
        },
        error: (err) => {
          this.status = STATUS_TYPE.ERROR;
          this.personError = err.error.detail;
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
      {
        next: (response) => {
          this.status = STATUS_TYPE.SUCCESS;
          this.personError = "";
          this.addUser(response.guid);
        },
        error: (err) => {
          this.status = STATUS_TYPE.ERROR;
          this.personError = err.error.detail;
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
          apiCalls.push(this.auth.removePhone(this.person.guid ?? '', phone[i]));
          continue;
        }

        if(phone[i].guid){
          phone[i].updated_by = this.user.guid;
          apiCalls.push(this.auth.updatePhone(phone[i].guid ?? '', phone[i]));
        }else{
          apiCalls.push(this.auth.addPhone(this.person.guid ?? '', phone[i]));
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
          apiCalls.push(this.auth.removeAddress(this.person.guid ?? '', address[i]));
          continue;
        }

        if(address[i].guid){
          address[i].updated_by = this.user.guid;
          apiCalls.push(this.auth.updateAddress(address[i].guid ?? '', address[i]));
        }else{
          apiCalls.push(this.auth.addAddress(this.person.guid ?? '', address[i]));
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

          this.notificationService.showNotification(
            'Error', this.addressError, 'error'
          );
        }else{
          this.notificationService.showNotification(
            'Success', 'Address/es added/modified successfully', 'success'
          );

          // reset new addresses only if all successfully added
          this.addresses = "";
        }

        // Refresh data after all operations are complete
        this.getPerson();
      });
    }
  }

}
