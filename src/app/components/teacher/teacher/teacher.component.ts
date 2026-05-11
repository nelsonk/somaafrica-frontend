import { Component, OnInit } from '@angular/core';
import { TableData, SAMPLE_TABLE_DATA } from '../../../models/table.interface';
import { TableComponent } from '../../../commons/table/table.component';
import { DetailsPageComponent } from '../../../commons/details-page/details-page.component';
import { DetailsData, DEFAULT_DETAILS_DATA } from '../../../models/details.interface';
import { NotificationService } from '../../../services/info/notification.service';
import { ConfirmationService } from '../../../services/info/confirmation.service';
import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../services/api/crud.service';
import { DEFAULT_TEACHER, Teacher } from '../../../models/teacher.interface';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../services/navigation/navigation.service';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [TableComponent, DetailsPageComponent, CommonModule],
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

  teachersUrl = `${environment.BASE_URL}/teachers/teacher`;

  constructor(
    private crud:CrudService,
    private notify: NotificationService,
    private navInterceptor: NavigationService
  ){
    this.getTeachers()
  }

  ngOnInit(): void {}

  onRowClick(row: any) {
    const teacher = this.getTeacher(row.guid);

    if (teacher){
      this.teacherData = teacher;
    }
  }

  onActionClick(event: {action: string, row: any}) {
    const {action, row} = event
    const teacher = this.getTeacher(row.guid);

    if (teacher){
      this.teacherData = teacher;
    }

    if (action === 'Edit'){}

    if (action === 'Delete'){}
  }

  onCloseDetail(){
    this.teacherData = null;
  }

  getTeachers(){
    this.crud.get(this.teachersUrl, {save_as: 'Teachers'}).subscribe({
      next: (response: any) => {
        this.teachersTable = this.setTeachersTable(response);
        this.teachers = response;
      },
      error: (er:any) => {
        this.notify.showNotification('Error', er.error.detail, 'error');
      }
    });
  }

  setTeachersTable(response: any){
    const HEADERS = [
      {label: 'GUID', key: 'guid', hide: true},
      { label: 'First Name', key: 'first_name', sortable: true },
      { label: 'Last Name', key: 'last_name', sortable: true },
      { label: 'Education Levels', key: 'education_levels', sortable: true },
      { label: 'Subjects', key: 'subjects', sortable: true },
      { label: 'Rating', key: 'rating', sortable: true }
    ];

    /* - ({}) tells typescript to return the object, no treating {} as
      function body
      - map (builtin, not the rxjs one) transforms array into another array
      after interating over each array item
      - join concatenates array items using defined seperator
    */
    const teacherRows = response.map((resp:any) => ({
      guid: resp.guid,
      first_name: resp.person_details.first_name,
      last_name: resp.person_details.last_name,
      education_levels: resp.education_levels
        .map((e:any) => e.level).join(', '),
      subjects: resp.subjects.map((s:any) => s.name).join(', '),
      rating: resp.rating
    }))

    return {
      caption: 'Teachers',
      pageSize: 10,
      headers: HEADERS,
      rows: teacherRows,
      actions: SAMPLE_TABLE_DATA.actions
    }
  }

  getTeacher(guid:string){
    for (let teacher of this.teachers) {
      if (teacher.guid == guid){
        const SUMMARY = {
          image: teacher.person_details.photo,
          summary: {
            "First Name": teacher.person_details.first_name,
            "Last Name": teacher.person_details.last_name,
            "Summary": teacher.summary,
            "Rating": teacher.rating
          }
        }

        const DETAILS = {
          title: 'Basic Details',
          details: {
            "Account Active": teacher.person_details.user.is_active,
            "Account Setup": teacher.person_details.account_status,
            "Is Admin": teacher.person_details.user.is_superuser,
            "Last login": teacher.person_details.user.last_login,
            "Date of birth": teacher.person_details.date_of_birth,
            "Gender": teacher.person_details.gender,
            "Phone number": teacher.person_details.phone
              .map((p:any) => p.number).join(', '),
            "Username": teacher.person_details.user.username,
            "Email": teacher.person_details.user.email,
            "Groups": teacher.person_details.user.groups.join(', '),
            "Addresses": teacher.person_details.address
              .map((a:any) => a.address).join(', '),
            "Education levels": teacher.education_levels
              .map((e:any) => e.level).join(', '),
            "Subjects": teacher.subjects.map((s:any) => s.name).join(', '),
            "Curriculums": teacher.curriculums
              .map((c:any) => c.name).join(', '),
            "Qualifications": teacher.qualifications,
            "Started teaching on": teacher.start_teaching_date,
            "Description": teacher.description,
            "Created at": teacher.person_details.created_at,
            "Created by": teacher.person_details.created_by,
            "Updated at": teacher.person_details.updated_at,
            "Updated by": teacher.person_details.updated_by
          }
        }

        return {
          summary: { ...SUMMARY },
          detail: { ...DETAILS }
        }
      }
    }

    return
  }

}
