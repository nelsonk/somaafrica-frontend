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
  groups = [
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
    private apiHealthService: ApiHealthService
  ){
    title.setTitle("SomaAfrica - Groups");
    const group = sessionStorage.getItem("User").groups

    if(Array.isArray(group) && group.length > 0){
      authService.navigateToPage("user/profile", "group")
    }
  }

  ngOnInit(): void {
    this.apiHealthService.isHealthy$.subscribe(
      (apiHealthy: boolean) => {
        this.apiNotHealthy = !apiHealthy;
      }
    );
  }

  selectGroup(group: string){
    this.authService.addGroup(group).subscribe(
      (response) => {
        if (response.status != STATUS_TYPE.ERROR){
          this.status = STATUS_TYPE.SUCCESS;
          this.authService.navigateToPage("user/profile", "group")
        }else{
          this.status = STATUS_TYPE.ERROR;
          this.notificationService.showNotification('Error', response.detail, 'error');
        }
      }
    );
  }

}
