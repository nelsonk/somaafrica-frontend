import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChalkboardTeacher, faBookReader, faSchoolCircleExclamation, faSackDollar } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/auth/auth-service.service';
import { STATUS_TYPE } from '../../utils/status-type';
import { NotificationService } from '../../services/info/notification.service';
import { SessionStorageService } from '../../services/storage/session-storage.service';
import { Title } from '@angular/platform-browser';
import { ApiHealthService } from '../../services/api/api-health.service';
import { NavigationService } from '../../services/navigation/navigation.service';

@Component({
  selector: 'app-group-selection',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './group-selection.component.html',
  styleUrl: './group-selection.component.css'
})
export class GroupSelectionComponent implements OnInit{
  STATUS_TYPE = STATUS_TYPE;
  status: STATUS_TYPE = STATUS_TYPE.NOT_LOADING;
  apiNotHealthy: boolean = false;
  faChalkboardTeacher = faChalkboardTeacher;
  faSchoolCircleExclamation = faSchoolCircleExclamation;
  faBookReader = faBookReader;
  faSackDollar = faSackDollar;
  roles = [
    {
      name: 'Teacher',
      description: 'Empower and educate the next generation.',
      icon: faChalkboardTeacher
    },
    {
      name: 'School',
      description: 'Manage your institution and community.',
      icon: faSchoolCircleExclamation
    },
    {
      name: 'Parent/Student',
      description: 'Stay connected to the school system.',
      icon: faBookReader
    },
    {
      name: 'Ambassador',
      description: 'Secure the bag as our Sales Ambassador!',
      icon: faSackDollar
    }
  ];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    sessionStorage: SessionStorageService,
    title: Title,
    private apiHealthService: ApiHealthService,
    private navInterceptor: NavigationService
  ){
    title.setTitle("SomaAfrica - Roles");
    const role = sessionStorage.getItem("User").groups

    if(Array.isArray(role) && role.length > 0){
      authService.navigateToPage("profile")
    }
  }

  ngOnInit(): void {
    this.apiHealthService.isHealthy$.subscribe(
      (apiHealthy: boolean) => {
        this.apiNotHealthy = !apiHealthy;
      }
    );
  }

  selectGroup(role: string){
    this.authService.selectRole(role).subscribe(
      {
        next: () => {
          this.status = STATUS_TYPE.SUCCESS;
          this.authService.navigateToPage("profile")
        },
        error: (err) => {
          this.status = STATUS_TYPE.ERROR;
          this.notificationService.showNotification('Error', err.error.detail, 'error');
        }
      }
    );
  }

}
