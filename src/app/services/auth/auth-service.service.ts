import { Injectable } from '@angular/core';
import { BehaviorSubject, of, switchMap, Observable} from 'rxjs';
import { STATUS_TYPE } from '../../utils/status-type';
import { SessionStorageService } from '../storage/session-storage.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { BaseResponse, TokenResponse } from '../../models/user.interface';
import { NotificationService } from '../info/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = new BehaviorSubject<boolean>(
    // sync with sessionStorage
    sessionStorage.getItem("isAuthenticated") === 'true'
  );
  isAuthenticated$ = this.authenticated.asObservable();
  user: any = {};

  constructor(
    private sessionStorage: SessionStorageService,
    private router: Router,
    private api: ApiService
  ){
    const isAuthenticatedStored = sessionStorage.getItem("isAuthenticated");
    this.user = sessionStorage.getItem("User");
    this.user = this.user? this.user : {}

    // this.authenticated is initiated to false so update it only on true
    if(isAuthenticatedStored && isAuthenticatedStored != this.authenticated.value){
      this.authenticated.next(isAuthenticatedStored);
    }
  }

  /**
   *
   * @param data
   * @returns
   * wWe set httpContext to BYPASS_AUTH_TOKEN
   */
  login(data: {}){
    const url = `${environment.BASE_URL}/login`;

    return this.api.post<TokenResponse>(url, data, { bypass: true }).pipe(
      tap({
        next: (response) => {
          this.authenticated.next(true);
          this.sessionStorage.setItem("isAuthenticated", true);
          this.sessionStorage.setItem("User", response.detail);

          const tokens = {
            access: response.access,
            refresh: response.refresh
          }

          this.sessionStorage.setItem("Token", tokens);
        },
        error: (error) => {
          this.authenticated.next(false);
          this.sessionStorage.setItem("isAuthenticated", false);
        }
      })
    );
  }

  logout(){
    this.authenticated.next(false);
    this.sessionStorage.clearEntireSession();
    return true;
  }

  refreshToken(): Observable<{ access: string; refresh: string }> {
    const url = `${environment.BASE_URL}/token/refresh`;
    const refreshToken = this.sessionStorage.getItem('Token')?.refresh;

    return this.api.post<{ access: string; refresh: string }>(
      url,
      { refresh: refreshToken },
      { bypass: true }  // Avoid infinite loop
    );
  }

  getUser(user_guid: string, save: boolean = false){
    const url = `${environment.BASE_URL}/persons/user/${user_guid}`;

    return this.api.get(url).pipe(
      tap({
        next: (response) => {
          if(save){
            this.sessionStorage.setItem("User", response);
          }
        }
      })
    );
  }

  register(data: {}){
    const url = `${environment.BASE_URL}/signup`;

    return this.api.post<BaseResponse>(url, data, { bypass: true });
  }

  selectRole(role: string){
    const selectRoleUrl = `${environment.BASE_URL}/persons/user/set_role`;
    const data = {
      role: role
    }

    return this.api.post<BaseResponse>(selectRoleUrl, data).pipe(
      tap({
        next: (response) => {
          if(response.status != STATUS_TYPE.ERROR){
            this.sessionStorage.setItem("User", response.detail);
          }
        }
      })
    );
  }

  changePassword(user_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/user/${user_guid}/change_password`;

    return this.api.patch<BaseResponse>(url, data);
  }

  requestPasswordReset(data: {}){
    const url = `${environment.BASE_URL}/request_password_reset`;

    return this.api.patch<BaseResponse>(url, data, {bypass: true});
  }

  resetPassword(guid: string, token: string, data: {}){
    const url = `${environment.BASE_URL}/reset_password/${guid}/${token}`;

    return this.api.patch<BaseResponse>(url, data, {bypass: true});
  }

  navigateToPage(target?: string, source?:string, guid?: string){
    this.router.navigate(
      [`/${target}`],
      {queryParams: {source: source, guid: guid}}
    );
  }

  createPerson(data: {}){
    const url = `${environment.BASE_URL}/persons/person`;

    return this.api.post<BaseResponse>(url, data);
  }

  getPerson(){
    const user_guid = this.sessionStorage.getItem("User").guid;
    const url = `${environment.BASE_URL}/persons/person?user__guid=${user_guid}`;

    return this.api.get<any>(url).pipe(
      tap({
        next: (response) => {
          this.sessionStorage.setItem("Person", response[0]);
        }
      })
    );
  }

  getPersons(){
    const url = `${environment.BASE_URL}/persons/person`;

    return this.api.get<any>(url).pipe(
      tap({
        next: (response) => {
          this.sessionStorage.setItem("Persons", response);
        }
      })
    );
  }

  updatePerson(person_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/person/${person_guid}`;

    return this.api.put<BaseResponse>(url, data);
  }

  addUserToPerson(person_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/person/${person_guid}/add_user`;

    return this.api.patch<BaseResponse>(url, data);
  }

  updateUser(user_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/user/${user_guid}`;

    return this.api.put<BaseResponse>(url, data);
  }

  addAddress(person_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/person/${person_guid}/add_address`;

    return this.api.patch<BaseResponse>(url, data);
  }

  removeAddress(person_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/person/${person_guid}/remove_address`;

    return this.api.patch<BaseResponse>(url, data);
  }

  updateAddress(address_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/address/${address_guid}`;

    return this.api.patch<BaseResponse>(url, data);
  }

  addPhone(person_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/person/${person_guid}/add_phone`;

    return this.api.patch<BaseResponse>(url, data);
  }

  removePhone(person_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/person/${person_guid}/remove_phone`;

    return this.api.patch<BaseResponse>(url, data);
  }

  updatePhone(phone_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/phone/${phone_guid}`;

    return this.api.put<BaseResponse>(url, data);
  }

}
