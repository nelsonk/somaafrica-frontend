import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TableData, SAMPLE_TABLE_DATA } from '../../../models/table.interface';
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
  subjectsUrl = `${environment.BASE_URL}/academics/subject`;
  curriculumUrl = `${environment.BASE_URL}/academics/curriculum`;
  educationLeveleUrl = `${environment.BASE_URL}/academics/level`;


  constructor(
    private crud:CrudService,
    private notify: NotificationService,
    private confirm: ConfirmationService,
    private navInterceptor: NavigationService,
    private title: Title,
    private apiHealth: ApiHealthService,
    private sessionStorage: SessionStorageService,
    private auth: AuthService
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
            this.getTeachers();
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
    const teacher = this.getTeacher(row.guid);

    if (teacher){
      this.action = null;
      this.teacherData = teacher;
    }
  }

  onActionClick(event: {action: string, row: any}) {
    const {action, row} = event;
    const teacher: any = this.getTeacher(row.guid);

    this.action = action ? action : null;

    if (teacher){
      if(this.action === 'Delete'){
        teacher.deletable = true;
      }

      this.teacherData = teacher;
    }
  }

  onCloseDetail(){
    this.teacherData = null;
  }

  onDelete(data:any){
    console.log("On Delete data: ", data)
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
          this.getTeachers()
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

    this.crud[method](url, this.prepareApiData(data)).subscribe(
      {
        next: () => {
          this.getTeachers();
          this.teacherData = null;
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

  prepareApiData(data:DetailSaveData){
    const person = data.detail.find(
        (d: DetailField) => d.key === 'person'
      ).value.value;
      const summary = data.detail.find(
        (d: DetailField) => d.key === 'summary'
      )?.value || data.summary.find(
        (d: DetailField) => d.key === 'summary'
      )?.value;
      const years_of_experience = data.detail.find(
        (d: DetailField) => d.key === 'years_of_experience'
      ).value;
      const qualifications = data.detail.find(
        (d: DetailField) => d.key === 'qualifications'
      ).value;
      const description = data.detail.find(
        (d: DetailField) => d.key === 'description'
      ).value;
      const education_levels = data.detail.find(
        (d: DetailField) => d.key === 'education_levels'
      ).value;
      const subjects = data.detail.find(
        (d: DetailField) => d.key === 'subjects'
      ).value;
      const curriculums = data.detail.find(
        (d: DetailField) => d.key === 'curriculums'
      ).value;

      const subjects_list = [];
      for (let subject of subjects) {
        subject.raw.updated_by = this.user.guid;

        subjects_list.push(subject.raw);
      }

      const levels_list = [];
      for (let level of education_levels) {
        level.raw.updated_by = this.user.guid;

        levels_list.push(level.raw);
      }

      const curriculum_list = [];
      for (let curriculum of curriculums) {
        curriculum.raw.updated_by = this.user.guid;

        curriculum_list.push(curriculum.raw);
      }

      return {
        created_by: this.user.guid,
        updated_by: this.user.guid,
        person: person,
        summary: summary,
        years_of_experience: years_of_experience,
        qualifications: qualifications,
        description: description,
        education_levels: levels_list,
        subjects: subjects_list,
        curriculums: curriculum_list
      }
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
      pageSize: 20,
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
          summary: [
            setDetail({
              key: 'first_name',
              label: "First Name",
              value: teacher.person_details.first_name,
              readonly: true
            }),
            setDetail({
              key: 'last_name',
              label: "Last Name",
              value: teacher.person_details.last_name,
              readonly: true
            }),
            setDetail({
              key: 'summary',
              label: "Summary",
              value: teacher.summary
            }),
            setDetail({
              key: 'rating',
              label: "Rating",
              value: teacher.rating,
              readonly: true
            })
          ]
        }

        const DETAILS = this.teacherDetails(teacher);

        return {
          callback: guid,
          editable: true,
          summary: { ...SUMMARY },
          detail: { ...DETAILS }
        }
      }
    }

    return
  }

  teacherDetails(teacher: any){
    return {
      title: 'Basic Details',
      details: [
        setDetail({
          key: 'person',
          label: "Person",
          type: "single-select",
          value: this.getPersons(teacher.person_details)[0],
          options: this.getPersons()
        }),
        setDetail({
          key: 'is_active',
          label: "Account Active",
          value: teacher.person_details.user.is_active,
          readonly: true
        }),
        setDetail({
          key: 'account_status',
          label: "Account Setup",
          value: teacher.person_details.account_status,
          readonly: true
        }),
        setDetail({
          key: 'is_superuser',
          label: "Is Admin",
          value: teacher.person_details.user.is_superuser,
          readonly: true
        }),
        setDetail({
          key: 'last_login',
          label: "Last login",
          value: teacher.person_details.user.last_login,
          readonly: true
        }),
        setDetail({
          key: 'date_of_birth',
          label: "Date of birth",
          value: teacher.person_details.date_of_birth,
          readonly: true
        }),
        setDetail({
          key: 'gender',
          label: "Gender",
          value: teacher.person_details.gender,
          readonly: true
        }),
        setDetail({
          key: 'phone',
          label: "Phone number",
          value: teacher.person_details.phone.map((p:any) => p.number).join(', '),
          readonly: true
        }),
        setDetail({
          key: 'username',
          label: "Username",
          value: teacher.person_details.user.username,
          readonly: true
        }),
        setDetail({
          key: 'email',
          label: "Email",
          value: teacher.person_details.user.email,
          readonly: true
        }),
        setDetail({
          key: 'groups',
          label: "Groups",
          value: teacher.person_details.user.groups.join(', '),
          readonly: true
        }),
        setDetail({
          key: 'address',
          label: "Addresses",
          value: teacher.person_details.address.map((a:any) => a.address).join(', '),
          readonly: true
        }),
        setDetail({
          key: 'education_levels',
          label: "Education levels",
          type: "multi-select",
          value: this.getEdecationLevels(teacher.education_levels),
          options: this.getEdecationLevels()
        }),
        setDetail({
          key: 'subjects',
          label: "Subjects",
          type: "multi-select",
          value: this.getSubjects(teacher.subjects),
          options: this.getSubjects()
        }),
        setDetail({
          key: 'curriculums',
          label: "Curriculums",
          type: "multi-select",
          value: this.getCurriculums(teacher.curriculums),
          options: this.getCurriculums()
        }),
        setDetail({
          key: 'years_of_experience',
          label: "Years of experience",
          type: "number",
          value: teacher.years_of_experience,
          required: false
        }),
        setDetail({
          key: 'created_at',
          label: "Created at",
          value: teacher.person_details.created_at,
          readonly: true
        }),
        setDetail({
          key: 'created_by',
          label: "Created by",
          value: teacher.person_details.created_by,
          readonly: true
        }),
        setDetail({
          key: 'updated_at',
          label: "Updated at",
          value: teacher.person_details.updated_at,
          readonly: true
        }),
        setDetail({
          key: 'updated_by',
          label: "Updated by",
          value: teacher.person_details.updated_by,
          readonly: true
        }),
        setDetail({
          key: 'qualifications',
          label: "Qualifications",
          type: "textarea",
          maxlength: 700,
          value: teacher.qualifications
        }),
        setDetail({
          key: 'description',
          label: "Description",
          type: "textarea",
          maxlength: 2000,
          value: teacher.description,
          required: false
        })
      ]
    }
  }

  createTeacher(){
    this.action = "Edit";

    this.teacherData = {
      editable: true,
      summary: {
        summary: [
          setDetail({key: 'title', value: 'Teacher', readonly: true})
        ]
      },
      detail: {
        title: 'Create Teacher',
        details: this.getCreateTeacher()
      }
    }
  }

  getCreateTeacher(){
    return [
      setDetail({
        key: 'person',
        type: 'single-select',
        options: this.getPersons(),
        placeholder:'select person'
      }),
      setDetail({
        key: 'summary',
        placeholder: 'Enter short pitch about yourself, max 250 characters'
      }),
      setDetail({
        key: 'years_of_experience',
        type: 'number' ,
        placeholder: 'Enter number of years spent teaching',
        required: false
      }),
      setDetail({
        key: 'education_levels',
        type: 'multi-select',
        options: this.getEdecationLevels(),
        placeholder: 'Select education levels'
      }),
      setDetail({
        key: 'subjects',
        type: 'multi-select',
        options: this.getSubjects(),
        placeholder: 'Select subjects'
      }),
      setDetail({
        key: 'curriculums',
        type: 'multi-select',
        options: this.getCurriculums(),
        placeholder: 'Select curriculums'
      }),
      setDetail({
        key: 'qualifications',
        type: 'textarea' ,
        maxlength: 700,
        placeholder: 'Enter Qualifications, max 700 characters'
      }),
      setDetail({
        key: 'description',
        type: 'textarea' ,
        maxlength: 2000,
        placeholder: 'Enter more details about yourself, max 2000 characters',
        required: false
      })
    ]
  }

  getPersons(data?: any){
    let persons: any = [];
    const persons_data: any = [];

    if(data){
      persons.push(data);
    }else{
      persons = this.sessionStorage.getItem("Persons");
    }

    if(persons && persons.length > 0){
      for (const person of persons){
        persons_data.push(
          {
            'label': `${person.first_name} ${person.last_name}`,
            'value': person.guid
          }
        );
      }

      return persons_data;
    }else{
      this.auth.getPersons().subscribe({
        next: (response) => {
          for (const person of response){
            persons_data.push(
              {
                'label': `${person.first_name} ${person.last_name}`,
                'value': person.guid,
                'raw': person
              }
            );
          }

          return persons_data;
        },
        error: (er:any) => {
          this.notify.showNotification('Error', er.error.detail, 'error');
        }
      });
    }
  }

  getSubjects(data?:any){
    let subjects: any = [];
    const subjects_data: any = [];

    if (data){
      subjects = data;
    }else{
      subjects = this.sessionStorage.getItem("Subjects");
    }

    if(subjects && subjects.length > 0){
      for (const subject of subjects){
        subjects_data.push(
          {
            'label': subject.name,
            'value': subject.guid,
            'raw': subject
          }
        );
      }

      return subjects_data;
    }else{
      this.crud.get(this.subjectsUrl, {save_as: 'Subjects'}).subscribe({
        next: (response: any) => {
          for (const subject of response){
            subjects_data.push(
              {
                'label': subject.name,
                'value': subject.guid,
                'raw': subject
              }
            );
          }

          return subjects_data;
        },
        error: (er:any) => {
          this.notify.showNotification('Error', er.error.detail, 'error');
        }
      });
    }
  }

  getCurriculums(data?:any){
    let curriculums: any = [];
    const curriculums_data: any = [];

    if (data){
      curriculums = data;
    }else{
      curriculums = this.sessionStorage.getItem("Curriculums");
    }

    if(curriculums && curriculums.length > 0){
      for (const curriculum of curriculums){
        curriculums_data.push(
          {
            'label': curriculum.name,
            'value': curriculum.guid,
            'raw': curriculum
          }
        );
      }

      return curriculums_data;
    }else{
      this.crud.get(this.curriculumUrl, {save_as: 'Curriculums'}).subscribe({
        next: (response: any) => {
          for (const curriculum of response){
            curriculums_data.push(
              {
                'label': curriculum.name,
                'value': curriculum.guid,
                'raw': curriculum
              }
            );
          }

          return curriculums_data;
        },
        error: (er:any) => {
          this.notify.showNotification('Error', er.error.detail, 'error');
        }
      });
    }
  }

  getEdecationLevels(data?:any){
    let levels: any = [];
    const levels_data:any = [];

    if (data){
      levels = data;
    }else{
      levels = this.sessionStorage.getItem("Levels");
    }

    if(levels && levels.length > 0){
      for (const level of levels){
        levels_data.push(
          {
            'label': level.level,
            'value': level.guid,
            'raw': level
          }
        );
      }

      return levels_data;
    }else{
      this.crud.get(this.educationLeveleUrl, {save_as: 'Levels'}).subscribe({
        next: (response: any) => {
          for (const level of response){
            levels_data.push(
              {
                'label': level.level,
                'value': level.guid,
                'raw': level
              }
            );
          }

          return levels_data
        },
        error: (er:any) => {
          this.notify.showNotification('Error', er.error.detail, 'error');
        }
      });
    }
  }

}
