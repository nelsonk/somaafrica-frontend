import { Injectable } from '@angular/core';
import { of, switchMap, take, tap } from 'rxjs';
import { ApiService } from './api.service';
import { SessionStorageService } from '../storage/session-storage.service';
import { CrudOptions } from '../../models/common.interface';
import { ApiHealthService } from './api-health.service';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor(private api:ApiService, private storage:SessionStorageService, private api_health:ApiHealthService) { }

  isAPIHealthy(saved_as:string){
    return this.api_health.isHealthy$.pipe(
      take(1),
      switchMap(
        (isHealthy) => {
          if (!isHealthy && saved_as){
            return of(this.storage.getItem(saved_as));
          }

          return of(isHealthy);
        }
      )
    );
  }

  get(url:string, options: CrudOptions = {}){
    /* Destructuring options */
    const {config = {}, save_as = ''} = options;

    return this.isAPIHealthy(save_as).pipe(
      switchMap((isHealthy) => {
        if (isHealthy === true) {
          return this.api.get(url, config).pipe(
            tap({
              next: (response) => {
                if (save_as) {
                  this.storage.setItem(save_as, response)
                }
              }
            })
          );
        }

        return of(isHealthy);
      })
    )
  }

  create(url: string, data: any, options: CrudOptions = {}){
    const {config = {}, save_as = ''} = options;

    return this.api.post(url, data, config).pipe(
      tap(
        {
          next: (response) => {
            if(save_as){
              this.storage.setItem(save_as, response)
            }
          }
        }
      )
    );
  }

  update(url: string, data: any, options: CrudOptions = {}){
    const {config = {}, save_as = ''} = options;

    return this.api.patch(url, data, config).pipe(
      tap(
        {
          next: (response) => {
            if (save_as){
              this.storage.setItem(save_as, response)
            }
          }
        }
      )
    );
  }

  /* You set remove to delete from storage */
  delete(url: string, options: CrudOptions = {}){
    const {config = {}, remove = ''} = options;

    return this.api.delete(url, config).pipe(
      tap({
        next: () => {
          if (remove){
            this.storage.removeItem(remove)
          }
        }
      })
    );
  }
}
