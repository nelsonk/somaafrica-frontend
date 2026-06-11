// annotation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AnnotationService {

  api = '/commons/annotations/';

  constructor(private http: HttpClient) {}

  get(documentId: string) {
    return this.http.get(this.api + '?document=' + documentId);
  }

  create(annotation: any) {
    return this.http.post(this.api, annotation);
  }

  delete(id: number) {
    return this.http.delete(this.api + id + '/');
  }
}
