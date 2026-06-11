import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TableData, ACTIONS } from '../../../models/table.interface';
import { TableComponent } from '../../../commons/table/table.component';
import { DetailsPageComponent } from '../../../commons/details-page/details-page.component';
import { DetailSaveData, DetailsData, SelectOption } from '../../../models/details.interface';
import { NotificationService } from '../../../services/info/notification.service';
import { ConfirmationService } from '../../../services/info/confirmation.service';
import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../services/api/crud.service';
import { DEFAULT_TEACHER } from '../../../models/teacher.interface';
import { DetailField } from '../../../models/details.interface';

import { NavigationService } from '../../../services/navigation/navigation.service';
import { ApiHealthService } from '../../../services/api/api-health.service';
import { SessionStorageService } from '../../../services/storage/session-storage.service';
import { setDetail } from '../../../utils/details-helper';
import { AuthService } from '../../../services/auth/auth-service.service';
import { TeacherService } from '../../../services/teacher/teacher.service';

@Component({
    selector: 'app-teacher',
    imports: [TableComponent, DetailsPageComponent],
    templateUrl: './teacher.component.html',
    styleUrl: './teacher.component.css'
})
export class TeacherComponent implements OnInit{
  teachersTable!: TableData;
  teacherData: DetailsData | null = null;
  teachers: any = [{ ...DEFAULT_TEACHER}]
  apiNotHealthy:boolean = true;
  fetchedFromApi = false;
  errorMessage: string = "";
  subjects: SelectOption[] = [];
  curriculums: SelectOption[] = [];
  levels: SelectOption[] = [];
  persons: SelectOption[] = [];
  action?: string | null = null;
  user: any;

  teachersUrl = `${environment.BASE_URL}/teachers/teacher`;

  constructor(
    private crud:CrudService,
    private notify: NotificationService,
    private confirm: ConfirmationService,
    private navInterceptor: NavigationService,
    private title: Title,
    private apiHealth: ApiHealthService,
    private sessionStorage: SessionStorageService,
    private teacher: TeacherService
  ){
    this.title.setTitle("SomaAfrica - Teacher");
  }

  ngOnInit(): void {
    this.user = this.sessionStorage.getItem("User");

    this.apiHealth.isHealthy$.subscribe(
      (isHealthy: boolean) => {
        this.apiNotHealthy = !isHealthy;

        if (isHealthy){
          if(!this.fetchedFromApi){
            this.teacher.getTeachers().subscribe(
              (resp) => {
                if (resp.table && resp.response) {
                  this.teachersTable = resp.table;
                  this.teachers = resp.response;
                }
              }
            );
          }

        }else{
          if (this.teachers[0]?.guid){
            return;
          }

          try {
            this.teachers = this.sessionStorage.getItem("Teachers");
          } catch (error) {
            console.log("Error getting Teachers from session storage: ", error)
          }
        }
      }
    );
  }

  onRowClick(row: any) {
    this.teacher.getTeacher(row.guid, this.teachers).subscribe(
      (data) => {
        if(data){
          this.action = null;
          this.teacherData = data;
        }
      }
    );
  }

  onActionClick(event: {action: string, row: any}) {
    const {action, row} = event;
    let teacher: any = '';

    this.teacher.getTeacher(row.guid, this.teachers).subscribe(
      (data) => {
        teacher = data;
      }
    );

    this.action = action ? action : null;

    if (teacher){
      if(this.action === 'Delete'){
        teacher.deletable = true;

      }else if (
        this.action === 'Activate' || this.action === 'De-Activate'
      ){
        teacher.summary.summary.find(
          (d: DetailField) => d.key === 'is_visible'
        ).value = !teacher.summary.summary.find(
          (d: DetailField) => d.key === 'is_visible'
        ).value;

        const data = {
          'callback': teacher.callback,
          'summary': teacher.summary.summary,
          'detail': teacher.detail.details
        }

        this.onSaveDetails(data);

        return
      }

      this.teacherData = teacher;
    }
  }

  onCloseDetail(){
    this.teacherData = null;
  }

  onDelete(data:any){
    this.confirm.confirm(
      'Delete',
      `Are you sure you want to delete teacher ${data.summary[0].value}?`,
      'error',
      this.deleteTeacher.bind(this, data)
    );
  }

  deleteTeacher(data: any){
    this.crud.delete(`${this.teachersUrl}/${data.callback}`).subscribe(
      {
        next: () => {
          this.notify.showNotification(
            'Success',
            'Teacher successfully deleted',
            'success'
          );

          this.teacherData = null;
          this.teacher.getTeachers().subscribe(
            (resp) => {
              if (resp.table && resp.response) {
                this.teachersTable = resp.table;
                this.teachers = resp.response;
              }
            }
          );
        },
        error: (er:any) => {
          this.notify.showNotification(
            'Error',
            JSON.stringify(er.error),
            'error'
          );
        }
      }
    )
  }

  onSaveDetails(data: DetailSaveData){
    const method = data.callback ? 'update' : 'create';
    const url = data.callback ?
      `${this.teachersUrl}/${data.callback}` : this.teachersUrl;

    this.crud[method](
      url,
      this.teacher.prepareApiData(data, this.user.guid)
    ).subscribe(
      {
        next: () => {
          this.teacherData = null;
          this.teacher.getTeachers().subscribe(
            (resp) => {
              if (resp.table && resp.response) {
                this.teachersTable = resp.table;
                this.teachers = resp.response;
              }
            }
          );

          this.notify.showNotification(
            'Success',
            `Teacher successfully ${method}d`,
            'success'
          );
        },
        error: (er:any) => {
          this.notify.showNotification(
            'Error',
            JSON.stringify(er.error),
            'error'
          );
        }
      }
    );

  }

  createTeacher(){
    this.action = "Edit";
    let details: any[] = [];

    this.teacher.getCreateTeacher().subscribe(
      (data) => {
        details = data
      }
    )

    this.teacherData = {
      editable: true,
      summary: {
        summary: [
          setDetail({key: 'title', value: 'Teacher', readonly: true})
        ]
      },
      detail: {
        title: 'Create Teacher',
        details: details
      }
    }
  }

}
