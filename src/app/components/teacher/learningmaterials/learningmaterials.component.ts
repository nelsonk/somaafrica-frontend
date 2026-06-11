import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { TableComponent } from '../../../commons/table/table.component';
import { DetailsPageComponent } from '../../../commons/details-page/details-page.component';

import { NotificationService } from '../../../services/info/notification.service';
import { ConfirmationService } from '../../../services/info/confirmation.service';
import { CrudService } from '../../../services/api/crud.service';
import { AuthService } from '../../../services/auth/auth-service.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ApiHealthService } from '../../../services/api/api-health.service';
import { SessionStorageService } from '../../../services/storage/session-storage.service';

import { TableData, ACTIONS } from '../../../models/table.interface';
import { DetailField } from '../../../models/details.interface';
import { DetailSaveData, DetailsData, SelectOption } from '../../../models/details.interface';
import { MATERIAL_TYPES } from '../../../models/learningmaterial.interface';

import { environment } from '../../../../environments/environment';
import { setDetail } from '../../../utils/details-helper';
import { LearningMaterialsService } from '../../../services/academics/learningmaterial.service';
import { TeacherService } from '../../../services/teacher/teacher.service';
import { DetailService } from '../../../services/detail/detail.service';

@Component({
  selector: 'app-learningmaterials',
  imports: [TableComponent, DetailsPageComponent],
  templateUrl: './learningmaterials.component.html',
  styleUrl: './learningmaterials.component.css',
})
export class LearningmaterialsComponent implements OnInit{
  materialData: DetailsData | null = null;
  materialsTable!: TableData;
  materials: any = [];
  action?: string | null = null;
  apiNotHealthy:boolean = true;
  fetchedFromApi = false;
  errorMessage: string = "";
  subjects: SelectOption[] = [];
  curriculums: SelectOption[] = [];
  levels: SelectOption[] = [];
  persons: SelectOption[] = [];
  user: any;

  materialsUrl = `${environment.BASE_URL}/academics/material`;
  subjectsUrl = `${environment.BASE_URL}/academics/subject`;
  curriculumUrl = `${environment.BASE_URL}/academics/curriculum`;
  classesUrl = `${environment.BASE_URL}/academics/class`;
  educationLeveleUrl = `${environment.BASE_URL}/academics/level`;
  teachersUrl = `${environment.BASE_URL}/teachers/teacher`;
  currenciesUrl = `${environment.BASE_URL}/payments/currency`;


  constructor(
    private crud:CrudService,
    private notify: NotificationService,
    private confirm: ConfirmationService,
    private navInterceptor: NavigationService,
    private title: Title,
    private apiHealth: ApiHealthService,
    private sessionStorage: SessionStorageService,
    private detail: DetailService,
    private learning: LearningMaterialsService
  ){
    this.title.setTitle("SomaAfrica - Learning Materials");
  }

  ngOnInit(): void {
    this.user = this.sessionStorage.getItem("User");

    this.apiHealth.isHealthy$.subscribe(
      (isHealthy: boolean) => {
        this.apiNotHealthy = !isHealthy;

        if (isHealthy){
          if(!this.fetchedFromApi){
            this.learning.getMaterials().subscribe(
              (resp: any) => {
                if (resp.table && resp.response) {
                  this.materialsTable = resp.table;
                  this.materials = resp.response;
                }
              }
            );
          }
        }else{
          if (this.materials[0]?.guid){
            return;
          }

          try {
            this.materials = this.sessionStorage.getItem("LearningMaterials");
          } catch (error) {
            console.log(
              "Error getting Learning materials from session storage: ",
              error
            );
          }
        }
      }
    );

  }

  onRowClick(row: any){
    this.learning.getMaterial(row.guid, this.materials).subscribe(
      (data) => {
        if(data){
          this.action = null;
          this.materialData = data;
        }
      }
    );
  }

  onActionClick(event: {action: string, row: any}) {
    const {action, row} = event;
    let  material: any = '';

    this.learning.getMaterial(row.guid, this.materials).subscribe(
      (data) => {
        material = data;
      }
    );

    this.action = action ? action : null;

    if (material){
      if(this.action === 'Delete'){
        material.deletable = true;

      }else if (
        this.action === 'Activate' || this.action === 'De-Activate'
      ){
        material.detail.details.find(
          (d: DetailField) => d.key === 'is_visible'
        ).value = !material.detail.details.find(
          (d: DetailField) => d.key === 'is_visible'
        ).value;

        const data = {
          'callback': material.callback,
          'summary': material.summary.summary,
          'detail': material.detail.details
        }

        this.onSaveDetails(data);

        return
      }

      this.materialData = material;
    }
  }

  createMaterial(){
    this.action = "Edit";
    let details: any[] = [];

    this.learning.getCreateMaterial().subscribe(
      (data) => {
        details = data
      }
    )

    this.materialData = {
      editable: true,
      summary: {
        summary: [
          setDetail({key: 'title', value: 'Learning Material', readonly: true})
        ]
      },
      detail: {
        title: 'Create Material',
        details: details
      }
    }
  }

  onCloseDetail(){
    this.materialData = null;
  }

  onDelete(data:any){
    this.confirm.confirm(
      'Delete',
      `Are you sure you want to delete teacher ${data.summary[0].value}?`,
      'error',
      this.deleteMaterial.bind(this, data)
    );
  }

  deleteMaterial(data: any){
    this.crud.delete(`${this.materialsUrl}/${data.callback}`).subscribe(
      {
        next: () => {
          this.notify.showNotification(
            'Success',
            'Teacher successfully deleted',
            'success'
          );

          this.materialData = null;

          this.learning.getMaterials().subscribe(
            (resp: any) => {
              if (resp.table && resp.response) {
                this.materialsTable = resp.table;
                this.materials = resp.response;
              }
            }
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
    )
  }

  onSaveDetails(data: DetailSaveData){
    const method = data.callback ? 'update' : 'create';
    const url = data.callback ?
      `${this.materialsUrl}/${data.callback}` : this.materialsUrl;

    const document = data.detail.find(
      (d: DetailField) => d.key === 'document'
    )?.value;

    this.crud[method](
      url,
      this.learning.prepareApiData(data, this.user.guid)
    ).subscribe(
      {
        next: (response: any) => {
          this.materialData = null;

          if (document){
            const guid = response.guid
            const file_url = `${this.materialsUrl}/${guid}/upload_file`

            this.detail.fileUpload(file_url, document).subscribe(
              {
                next: () => {
                  this.learning.getMaterials().subscribe(
                    (resp: any) => {
                      if (resp.table && resp.response) {
                        this.materialsTable = resp.table;
                        this.materials = resp.response;
                      }
                    }
                  );
                },
                error: (er) => {
                  this.notify.showNotification(
                    'Error',
                    JSON.stringify(er.error),
                    'error'
                  );
                }
              }
            );
          }

          this.learning.getMaterials().subscribe(
            (resp: any) => {
              if (resp.table && resp.response) {
                this.materialsTable = resp.table;
                this.materials = resp.response;
              }
            }
          );

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
}
