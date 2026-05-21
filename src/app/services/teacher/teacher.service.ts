import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { SessionStorageService } from '../storage/session-storage.service';
import { tap } from 'rxjs';
import { Teacher } from '../../models/teacher.interface';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  constructor(
    private storage: SessionStorageService,
    private api: ApiService
  ) { }

  getTeacher(guid: string, save: boolean = false){
    const url = `${environment.BASE_URL}/teachers/teacher/${guid}`

    return this.api.get(url).pipe(
      tap({
        next: (response) => {
          if(save){
            this.storage.setItem('Teacher', response)
          }
        }
      })
    )
  }

  getTeachers(save: boolean = false){
    const url = `${environment.BASE_URL}/teachers/teacher`

    return this.api.get(url).pipe(
      tap({
        next: (response) => {
          if(save){
            this.storage.setItem('Teachers', response)
          }
        }
      })
    )
  }

  createTeacher(data: Teacher, save: boolean = false){
    const url = `${environment.BASE_URL}/teachers/teacher`

    return this.api.post(url, data).pipe(
      tap({
        next: (response) => {
          if(save){
            this.storage.setItem('Teacher', response)
          }
        }
      })
    )
  }

  updateTeacher(guid: string, data: Teacher, save: boolean = false){
    const url = `${environment.BASE_URL}/teachers/teacher/${guid}`

    return this.api.patch(url, data).pipe(
      tap({
        next: (response) => {
          if(save){
            this.storage.setItem('Teacher', response)
          }
        }
      })
    )
  }

}
