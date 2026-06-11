import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../info/notification.service';
import { CrudService } from '../api/crud.service';
import { setDetail } from '../../utils/details-helper';
import { ACTIONS } from '../../models/table.interface';
import { TableResponse } from '../../models/table.interface';
import { DetailService } from '../detail/detail.service';
import { Observable, pipe, map, of, catchError, forkJoin } from 'rxjs';
import { MATERIAL_TYPES } from '../../models/learningmaterial.interface';
import { User } from '../../models/user.interface';
import { DetailField, DetailSaveData } from '../../models/details.interface';

@Injectable({
  providedIn: 'root',
})
export class LearningMaterialsService {
  materialsUrl = `${environment.BASE_URL}/academics/material`;
  subjectsUrl = `${environment.BASE_URL}/academics/subject`;
  curriculumUrl = `${environment.BASE_URL}/academics/curriculum`;
  classesUrl = `${environment.BASE_URL}/academics/class`;
  educationLeveleUrl = `${environment.BASE_URL}/academics/level`;
  teachersUrl = `${environment.BASE_URL}/teachers/teacher`;
  currenciesUrl = `${environment.BASE_URL}/payments/currency`;

  constructor(
    private notify: NotificationService,
    private crud: CrudService,
    private detail: DetailService
  ){}

  getMaterials():Observable<TableResponse>{
    let materialsTable: any = '';
    let materials: any = '';

    return this.crud.get(
      this.materialsUrl, {save_as: 'LearningMaterials'}
    ).pipe(
      map((response: any) =>
        ({
          table: this.setMaterialsTable(response),
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
          table: materialsTable,
          response: materials
        })
      })
    );
  }

  setMaterialsTable(response: any){
    const HEADERS = [
      {label: 'GUID', key: 'guid', hide: true},
      { label: 'Title', key: 'title', sortable: true },
      { label: 'Type', key: 'type', sortable: true },
      { label: 'Price', key: 'price', sortable: true },
      { label: 'Currency', key: 'currency', sortable: true },
      { label: 'Classes', key: 'classes', sortable: true }
    ];

    /* - ({}) tells typescript to return the object, no treating {} as
      function body
      - map (builtin, not the rxjs one) transforms array into another array
      after interating over each array item
      - join concatenates array items using defined seperator
    */
    const materialRows = response.map((resp:any) => {
      const visible = resp.is_visible;

      return {
        guid: resp.guid,
        title: resp.title,
        type: resp.type,
        price: resp.price,
        currency: resp.currency.currency,
        classes: resp.classes.map((s:any) => s.name).join(', '),
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
      caption: 'Learning Materials',
      pageSize: 20,
      headers: HEADERS,
      rows: materialRows
    }
  }

  materialDetails(material: any){
    return forkJoin({
      teacher: this.detail.getTeachers(material.teacher),
      teachers: this.detail.getTeachers(),
      subject: this.detail.getDetails(
        {data:material.subjects, model: 'Subjects'}
      ),
      subjects: this.detail.getDetails({model: 'Subjects'}),
      curriculum: this.detail.getDetails(
        {data: material.curriculum, model: 'Curriculums'}
      ),
      curriculums: this.detail.getDetails({model: 'Curriculums'}),
      currency: this.detail.getDetails(
        {data: material.currency, model: 'Currencies', column: 'currency'}
      ),
      currencies: this.detail.getDetails(
        {model: 'Currencies', column: 'currency'}
      ),
      clasz: this.detail.getDetails(
        {data: material.classes, model: 'Classes'}
      ),
      classes: this.detail.getDetails({model: 'Classes'})
    }).pipe(
      map( (data) => {
        let documentUrl: string = ''

        if (material?.document){
          const docGuid = material.document.guid;
          documentUrl = `${environment.BASE_URL}/documents/${docGuid}/view`;
        }

        return {
          title: 'Basic Details',
          document: documentUrl,
          details: [
            setDetail({
              key: 'is_free',
              label: "Is Free",
              value: material.is_free,
              type: 'boolean',
              required: false
            }),
            setDetail({
              key: 'is_visible',
              label: "Is Visible",
              value: material.is_visible,
              type: 'boolean',
              required: false
            }),
            setDetail({
              key: 'price',
              label: "Price",
              value: material.price,
              type: 'number',
              required: false
            }),
            setDetail({
              key: 'type',
              label: 'Type',
              value: MATERIAL_TYPES.filter(
                (mat) => (mat.value == material.type)
              )[0],
              type: 'single-select',
              options: MATERIAL_TYPES
            }),
            setDetail({
              key: 'currency',
              label: "Currency",
              type: "single-select",
              value: data.currency[0],
              options: data.currencies
            }),
            setDetail({
              key: 'subjects',
              label: "Subjects",
              type: "multi-select",
              value: data.subject,
              options: data.subjects
            }),
            setDetail({
              key: 'curriculum',
              label: "Curriculum",
              type: "single-select",
              value: data.curriculum[0],
              options: data.curriculums
            }),
            setDetail({
              key: 'classes',
              label: "Classes",
              type: "multi-select",
              value: data.clasz,
              options: data.classes
            }),
            setDetail({
              key: 'teacher',
              label: "Teacher",
              type: "single-select",
              value: data.teacher[0],
              options: data.teachers,
              required: false
            }),
            setDetail({
              key: 'school',
              label: "School",
              type: "single-select",
              value: null,
              options: [],
              required: false
            }),
            setDetail({
              key: 'document',
              label: "File Name",
              value: material?.document?.file,
              type: 'file',
              required: false
            }),
            setDetail({
              key: 'created_at',
              label: "Created at",
              value: material.created_at,
              readonly: true
            }),
            setDetail({
              key: 'created_by',
              label: "Created by",
              value: material.created_by,
              readonly: true
            }),
            setDetail({
              key: 'updated_at',
              label: "Updated at",
              value: material.updated_at,
              readonly: true
            }),
            setDetail({
              key: 'updated_by',
              label: "Updated by",
              value: material.updated_by,
              readonly: true
            }),
            setDetail({
              key: 'description',
              label: "Description",
              type: "textarea",
              maxlength: 2000,
              value: material.description,
              required: false
            })
          ]
        }
      })
    );
  }

  getCreateMaterial(){
    return forkJoin({
      teachers: this.detail.getTeachers(),
      subjects: this.detail.getDetails({model: 'Subjects'}),
      curriculums: this.detail.getDetails({model: 'Curriculums'}),
      currencies: this.detail.getDetails(
        {model: 'Currencies', column: 'currency'}
      ),
      classes: this.detail.getDetails({model: 'Classes'})
    }).pipe(
      map( (data) => (
        [
          setDetail({
            key: 'title',
            label: "Title"
          }),
          setDetail({
            key: 'type',
            label: 'Type',
            type: 'single-select',
            options: MATERIAL_TYPES
          }),
          setDetail({
            key: 'is_free',
            label: "Is Free",
            type: 'boolean',
            required: false
          }),
          setDetail({
            key: 'is_visible',
            label: "Is Visible",
            type: 'boolean',
            required: false
          }),
          setDetail({
            key: 'price',
            label: "Price",
            type: 'number',
            required: false
          }),
          setDetail({
            key: 'currency',
            label: "Currency",
            type: "single-select",
            options: data.currencies
          }),
          setDetail({
            key: 'subjects',
            label: "Subjects",
            type: "multi-select",
            options: data.subjects
          }),
          setDetail({
            key: 'curriculum',
            label: "Curriculum",
            type: "single-select",
            options: data.curriculums
          }),
          setDetail({
            key: 'classes',
            label: "Classes",
            type: "multi-select",
            options: data.classes
          }),
          setDetail({
            key: 'teacher',
            label: "Teacher",
            type: "single-select",
            options: data.teachers,
            required: false
          }),
          setDetail({
            key: 'school',
            label: "School",
            type: "single-select",
            value: null,
            options: [],
            required: false
          }),
          setDetail({
            key: 'document',
            label: "File / Document",
            type: 'file',
            required: false
          }),
          setDetail({
            key: 'description',
            type: 'textarea' ,
            maxlength: 2000,
            placeholder: 'Enter more details about yourself, max 2000 characters',
            required: false
          })
        ]
      ))
    )
  }

  getMaterial(guid: string, materials: any): Observable<any>{
    for (let material of materials) {
      if (material.guid == guid){
        const SUMMARY = {
          summary: [
            setDetail({
              key: 'title',
              label: "Title",
              value: material.title
            })
          ]
        }

        return this.materialDetails(material).pipe(
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

  prepareApiData(data:DetailSaveData, user_guid: User){
    const title = data.summary.find(
      (d: DetailField) => d.key === 'title'
    )?.value;

    const is_visible = data.detail.find(
      (d: DetailField) => d.key === 'is_visible'
    )?.value

    const is_free = data.detail.find(
      (d: DetailField) => d.key === 'is_free'
    )?.value;

    const teacher = data.detail.find(
      (d: DetailField) => d.key === 'teacher'
    )?.value?.value;

    const school = data.detail.find(
      (d: DetailField) => d.key === 'school'
    )?.value?.value;

    const currency = data.detail.find(
      (d: DetailField) => d.key === 'currency'
    )?.value?.raw;

    currency.updated_by = user_guid;

    const classes = data.detail.find(
      (d: DetailField) => d.key === 'classes'
    )?.value;

    const subjects = data.detail.find(
      (d: DetailField) => d.key === 'subjects'
    )?.value;

    const curriculum = data.detail.find(
      (d: DetailField) => d.key === 'curriculum'
    )?.value?.raw;

    curriculum.updated_by = user_guid;

    const price = data.detail.find(
      (d: DetailField) => d.key === 'price'
    )?.value;

    const type = data.detail.find(
      (d: DetailField) => d.key === 'type'
    )?.value.value;

    const description = data.detail.find(
      (d: DetailField) => d.key === 'description'
    )?.value;

    const subjects_list = Array.isArray(subjects)
      ? subjects.map(
        (subject) => {
          subject.raw.updated_by = user_guid

          return subject.raw
        }
      )
      : [];

    const classes_list = Array.isArray(classes)
      ? classes.map(
        (clasz) => {
          clasz.raw.updated_by = user_guid;
          clasz.raw.education_level.updated_by = user_guid;

          return clasz.raw
        }
      )
      : [];

    return {
      created_by: user_guid,
      updated_by: user_guid,
      teacher: teacher,
      is_visible: is_visible,
      school: school,
      is_free: is_free,
      price: price,
      title: title,
      type: type,
      currency: currency,
      description: description,
      classes: classes_list,
      subjects: subjects_list,
      curriculum: curriculum
    }
  }

}
