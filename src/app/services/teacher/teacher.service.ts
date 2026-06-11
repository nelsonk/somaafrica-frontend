import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ACTIONS, TableResponse } from '../../models/table.interface';
import { CrudService } from '../api/crud.service';
import { setDetail } from '../../utils/details-helper';
import { NotificationService } from '../info/notification.service';
import { AuthService } from '../auth/auth-service.service';
import { SessionStorageService } from '../storage/session-storage.service';
import { LearningMaterialsService } from '../academics/learningmaterial.service';
import { DetailSaveData, DetailField } from '../../models/details.interface';
import { DetailService } from '../detail/detail.service';
import { Observable, of, map, pipe, catchError, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  teachersUrl = `${environment.BASE_URL}/teachers/teacher`;

  constructor(
    private crud: CrudService,
    private notify: NotificationService,
    private auth: AuthService,
    private sessionStorage: SessionStorageService,
    private detail: DetailService
  ) { }

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
      const teacherRows = response.map((resp:any) => {
        const visible = resp.is_visible;

        return {
          guid: resp.guid,
          first_name: resp.person_details.first_name,
          last_name: resp.person_details.last_name,
          education_levels: resp.education_levels
            .map((e:any) => e.level).join(', '),
          subjects: resp.subjects.map((s:any) => s.name).join(', '),
          rating: resp.rating,
          actions: [...ACTIONS,
            {
              'label': visible ? 'De-Activate' : 'Activate',
              'icon': visible ? 'fa-solid fa-toggle-off' : 'fa-solid fa-toggle-on',
              'class': visible ? 'btn-outline-danger' : 'btn-outline-success'
            }
          ]
        }
      });

      return {
        caption: 'Teachers',
        pageSize: 20,
        headers: HEADERS,
        rows: teacherRows
      }
    }

    getTeacher(guid:string, teachers: any): Observable<any>{
      for (let teacher of teachers) {
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
                key: 'is_visible',
                label: "Is Visible",
                value: teacher.is_visible,
                type: 'boolean',
                required: false
              }),
              setDetail({
                key: 'rating',
                label: "Rating",
                value: teacher.rating,
                readonly: true
              })
            ]
          }

          return this.teacherDetails(teacher).pipe(
            map((detail) => ({
              callback: guid,
              editable: true,
              summary: { ...SUMMARY },
              detail: { ...detail }
            }))
          );
        }
      }

      return of()
    }

    teacherDetails(teacher: any): Observable<any>{
      return forkJoin({
        person: this.detail.getPersons(teacher.person_details),
        persons: this.detail.getPersons(),
        subject: this.detail.getDetails(
        {data:teacher.subjects, model: 'Subjects'}
        ),
        subjects: this.detail.getDetails({model: 'Subjects'}),
        curriculum: this.detail.getDetails(
          {data: teacher.curriculums, model: 'Curriculums'}
        ),
        curriculums: this.detail.getDetails({model: 'Curriculums'}),
        level: this.detail.getDetails(
          {data: teacher.education_levels, model: 'Levels', column: 'level'}
        ),
        levels: this.detail.getDetails({model: 'Levels', column: 'level'})
      }).pipe(
        map( (data) => (
          {
            title: 'Basic Details',
            details: [
              setDetail({
                key: 'person',
                label: "Person",
                type: "single-select",
                value: data.person[0],
                options: data.persons
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
                value: teacher.person_details.address.map(
                  (a:any) => a.address
                ).join(', '),
                readonly: true
              }),
              setDetail({
                key: 'education_levels',
                label: "Education levels",
                type: "multi-select",
                value: data.level,
                options: data.levels
              }),
              setDetail({
                key: 'subjects',
                label: "Subjects",
                type: "multi-select",
                value: data.subject,
                options: data.subjects
              }),
              setDetail({
                key: 'curriculums',
                label: "Curriculums",
                type: "multi-select",
                value: data.curriculum,
                options: data.curriculums
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
                value: teacher.created_at,
                readonly: true
              }),
              setDetail({
                key: 'created_by',
                label: "Created by",
                value: teacher.created_by,
                readonly: true
              }),
              setDetail({
                key: 'updated_at',
                label: "Updated at",
                value: teacher.updated_at,
                readonly: true
              }),
              setDetail({
                key: 'updated_by',
                label: "Updated by",
                value: teacher.updated_by,
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
        )
      ))
    }

    getTeachers():Observable<TableResponse>{
      let teachersTable: any = '';
      let teachers: any = '';

      return this.crud.get(this.teachersUrl, {save_as: 'Teachers'}).pipe(
        map((response: any) =>
          ({
            table: this.setTeachersTable(response),
            response: response
          })
        ),
        catchError ((er:any) => {
          this.notify.showNotification(
            'Error',
            JSON.stringify(er.error),
            'error'
          );

          return of({
            table: teachersTable,
            response: teachers
          })
        })
      );
    }

    getCreateTeacher(): Observable<any>{
      return forkJoin({
        person: this.detail.getPersons(),
        subjects: this.detail.getDetails({model: 'Subjects'}),
        curriculums: this.detail.getDetails({model: 'Curriculums'}),
        levels: this.detail.getDetails({model: 'Levels', column: 'level'})
      }).pipe(
        map(data => (
          [
            setDetail({
              key: 'person',
              type: 'single-select',
              options: data.person,
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
              options: data.levels,
              placeholder: 'Select education levels'
            }),
            setDetail({
              key: 'subjects',
              type: 'multi-select',
              options: data.subjects,
              placeholder: 'Select subjects'
            }),
            setDetail({
              key: 'curriculums',
              type: 'multi-select',
              options: data.curriculums,
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
        )
      ))
    }

    prepareApiData(data:DetailSaveData, user_guid: string){
      const is_visible = data.summary.find(
        (d: DetailField) => d.key === 'is_visible'
      )?.value ?? data.detail.find(
        (d: DetailField) => d.key === 'is_visible'
      )?.value;

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
        subject.raw.updated_by = user_guid;

        subjects_list.push(subject.raw);
      }

      const levels_list = [];
      for (let level of education_levels) {
        level.raw.updated_by = user_guid;

        levels_list.push(level.raw);
      }

      const curriculum_list = [];
      for (let curriculum of curriculums) {
        curriculum.raw.updated_by = user_guid;

        curriculum_list.push(curriculum.raw);
      }

      return {
        created_by: user_guid,
        updated_by: user_guid,
        person: person,
        is_visible: is_visible,
        summary: summary,
        years_of_experience: years_of_experience,
        qualifications: qualifications,
        description: description,
        education_levels: levels_list,
        subjects: subjects_list,
        curriculums: curriculum_list
      }
    }

}
