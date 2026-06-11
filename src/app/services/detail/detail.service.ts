import { Injectable } from '@angular/core';
import { SessionStorageService } from '../storage/session-storage.service';
import { CrudService } from '../api/crud.service';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../info/notification.service';
import { Observable, of, pipe, map, catchError } from 'rxjs';
import { DetailRequest, SelectOption } from '../../models/details.interface';

@Injectable({
  providedIn: 'root',
})
export class DetailService {
  urls: Record<string, string> = {
    Subjects: `${environment.BASE_URL}/academics/subject`,
    Curriculums: `${environment.BASE_URL}/academics/curriculum`,
    Classes: `${environment.BASE_URL}/academics/class`,
    Levels: `${environment.BASE_URL}/academics/level`,
    Teachers: `${environment.BASE_URL}/teachers/teacher`,
    Currencies: `${environment.BASE_URL}/payments/currency`,
    Persons: `${environment.BASE_URL}/persons/person`
  }

  constructor(
    private sessionStorage: SessionStorageService,
    private crud: CrudService,
    private notify: NotificationService
  ){}

  getTeachers(data?: any): Observable<any[]>{
    let teachers: any = [];
    const teachers_data:any = [];

    teachers = this.sessionStorage.getItem("Teachers");

    if(teachers && teachers.length > 0){
      teachers = data ? teachers.filter((teacher:any) => teacher.guid === data
      ) : teachers

      for (const teacher of teachers){
        const first_name = teacher.person_details.first_name;
        const last_name = teacher.person_details.last_name;

        teachers_data.push(
          {
            'label': `${first_name} ${last_name}`,
            'value': teacher.guid,
            'raw': teacher
          }
        );
      }

      return of(teachers_data);
    }else{
      return this.crud.get(this.urls['Teachers'], {save_as: 'Teachers'}).pipe(
        map((response: any) => {
          for (const teacher of response){
            const first_name = teacher.person_details.first_name;
            const last_name = teacher.person_details.last_name;

            teachers_data.push(
              {
                'label': `${first_name} ${last_name}`,
                'value': teacher.guid,
                'raw': teacher
              }
            );
          }

          return teachers_data
        }),
        catchError((er:any) => {
          this.notify.showNotification(
            'Error',
            JSON.stringify(er.error),
            'error'
          );

          return of([])
        })
      );
    }
  }

  getPersons(data?: any): Observable<any[]>{
    let persons: any = [];
    const persons_data: any = [];

    persons = this.sessionStorage.getItem("Persons");

    if(persons && persons.length > 0){
      persons = data ? persons.filter((person:any) => person.guid === data.guid
      ) : persons

      for (const person of persons){
        persons_data.push(
          {
            'label': `${person.first_name} ${person.last_name}`,
            'value': person.guid
          }
        );
      }

      return of(persons_data);
    }else{
      return this.crud.get(this.urls['Persons'], {save_as: 'Persons'}).pipe(
        map((response) => {
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
        }),
        catchError((er:any) => {
          this.notify.showNotification(
            'Error',
            JSON.stringify(er.error),
            'error'
          );

          return of([])
        })
      );
    }
  }

  getDetails(data:DetailRequest): Observable<any[]>{
    const column = data.column || 'name';
    const url = data.url || this.urls[data.model];

    const data_array = data.data ?? this.sessionStorage.getItem(data.model);

    const details = Array.isArray(data_array)
      ? data_array
      : data_array
        ? [data_array]
        : null;

    if(details){
      if(details.length == 0){
        return of([]);
      }

      const details_data = details.map((detail:any) => ({
        'label': detail[column],
        'value': detail.guid,
        'raw': detail
      }));

      return of(details_data);
    }else{
      return this.crud.get(url, {save_as: data.model}).pipe(
        map((response: any[]) =>
          response.map(detail => ({
            'label': detail[column],
            'value': detail.guid,
            'raw': detail
          }))
        ),
        catchError ((er:any) => {
          this.notify.showNotification(
            'Error',
            JSON.stringify(er.error),
            'error'
          );

          return of([]);
        })
      );
    }
  }

  fileUploadFormData(data: any): FormData | null {
    if (!(data instanceof File || data instanceof Blob)) {
      return null;
    }

    const formData = new FormData();
    formData.append('file', data);

    return formData;
  }

  fileUpload(url: string, file: any): Observable<any>{
    const fileData = this.fileUploadFormData(file);

    if (!fileData) return of();

    return this.crud.update(url, fileData)
  }
}
