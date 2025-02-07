import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, retry, timeout, of, switchMap, throwError } from 'rxjs';
import { STATUS_TYPE } from '../../utils/status-type';
import { SessionStorageService } from '../storage/session-storage.service';
import { Router } from '@angular/router';
import { HttpContext } from '@angular/common/http';
import { HttpContextToken } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { getRequest, postRequest, putRequest, deleteRequest, patchRequest } from '../../utils/http-helper';
import { tap } from 'rxjs';
import { BYPASS_INTERCEPTOR } from '../../utils/http-context-tokens';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.authenticated.asObservable();
  user: any = {};

  constructor(
    private httpClient: HttpClient,
    private sessionStorage: SessionStorageService,
    private router: Router
  ){
    const isAuthenticatedStored = sessionStorage.getItem("isAuthenticated");
    this.user = sessionStorage.getItem("User");

    if(isAuthenticatedStored){
      this.authenticated.next(isAuthenticatedStored);
    }
  }

  /**
   *
   * @param data
   * @returns
   * wWe set httpContext to BYPASS_INTERCEPTOR
   */
  login(data: {}){
    const url = `${environment.BASE_URL}/login`;

    return this.sendRequest(url, "post", data, true).pipe(
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

  getUser(user_guid: string, save: boolean = false){
    const url = `${environment.BASE_URL}/persons/user/${user_guid}`;

    return this.sendRequest(url, "get").pipe(
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

    return this.sendRequest(url, "post", data, true);
  }

  addGroup(group: string){
    const getGroupUrl = `${environment.BASE_URL}/persons/group?name=${group}`;
    const data = {
      user_guid: this.user.guid
    }

    return this.sendRequest(getGroupUrl, "get").pipe(
      switchMap((response: any) => {
        if (Array.isArray(response) && response.length == 0) {
          return of({status: STATUS_TYPE.ERROR, detail: `Group '${group}' not found`});
        }else if(Array.isArray(response) && response.length > 0){
          let group_guid = response[0].guid;
          const addUserUrl = `${environment.BASE_URL}/persons/group/${group_guid}/add_user`;

          return this.sendRequest(addUserUrl, "patch", data).pipe(
            switchMap((response: any) => {
              if(response.status != STATUS_TYPE.ERROR){
                this.getUser(this.user.guid, true).subscribe();
              }
              return of(response);
            })
          );
        }else{
          return of(response);
        }
      })
    );
  }

  logout(){
    this.authenticated.next(false);
    this.sessionStorage.clearEntireSession();
    return true;
  }

  changePassword(user_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/user/${user_guid}/change_password`;

    return this.sendRequest(url, "patch", data);
  }

  requestPasswordReset(data: {}){
    const url = `${environment.BASE_URL}/request_password_reset`;

    return this.sendRequest(url, "patch", data, true);
  }

  resetPassword(guid: string, token: string, data: {}){
    const url = `${environment.BASE_URL}/reset_password/${guid}/${token}`;

    return this.sendRequest(url, "patch", data, true);
  }

  navigateToPage(target?: string, source?:string){
    this.router.navigate([`/${target}`], {queryParams: {source: source}});
  }

  createPerson(data: {}){
    const url = `${environment.BASE_URL}/persons/person`;

    return this.sendRequest(url, "post", data);
  }

  getPerson(){
    const user_guid = this.sessionStorage.getItem("User").guid;
    const url = `${environment.BASE_URL}/persons/person?user__guid=${user_guid}`;

    return this.sendRequest(url, "get").pipe(
      tap({
        next: (response) => {
          this.sessionStorage.setItem("Person", response[0]);
        }
      })
    );
  }

  updatePerson(person_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/person/${person_guid}`;

    return this.sendRequest(url, "put", data);
  }

  addUserToPerson(person_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/person/${person_guid}/add_user`;

    return this.sendRequest(url, "patch", data);
  }

  updateUser(user_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/user/${user_guid}`;

    return this.sendRequest(url, "put", data);
  }

  addAddress(person_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/person/${person_guid}/add_address`;

    return this.sendRequest(url, "patch", data);
  }

  removeAddress(person_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/person/${person_guid}/remove_address`;

    return this.sendRequest(url, "patch", data);
  }

  updateAddress(address_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/address/${address_guid}`;

    return this.sendRequest(url, "patch", data);
  }

  addPhone(person_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/person/${person_guid}/add_phone`;

    return this.sendRequest(url, "patch", data);
  }

  removePhone(person_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/person/${person_guid}/remove_phone`;

    return this.sendRequest(url, "patch", data);
  }

  updatePhone(phone_guid: string, data: {}){
    const url = `${environment.BASE_URL}/persons/phone/${phone_guid}`;

    return this.sendRequest(url, "put", data);
  }

  sendRequest(
    url: string,
    method: "get" | "post" | "put" | "delete" | "patch",
    data: any = {},
    bypass: boolean = false
  ) {
    const options = {
      context: new HttpContext().set(BYPASS_INTERCEPTOR, bypass),
    };

    let request;

    switch (method) {
      case "get":
        request = getRequest(this.httpClient, url, options);
        break;
      case "post":
        request = postRequest(this.httpClient, url, data, options);
        break;
      case "put":
        request = putRequest(this.httpClient, url, data, options);
        break;
      case "delete":
        request = deleteRequest(this.httpClient, url, options);
        break;
      case "patch":
        request = patchRequest(this.httpClient, url, data, options);
        break;
      default:
        throw new Error(`Invalid HTTP method: ${method}`);
    }

    return request.pipe(
      timeout(30000),
      retry(3),
      map((response) => response),
      catchError((err) => {
        if(err.error?.detail == "Given token not valid for any token type"){
          this.authenticated.next(false);
          this.sessionStorage.setItem("isAuthenticated", false);
          this.logout();
        }

        return of({ ...err.error, status: STATUS_TYPE.ERROR })
    })
    );
  }

}
