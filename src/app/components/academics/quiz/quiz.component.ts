import { Component, inject, OnInit } from '@angular/core';
import { TableComponent } from '../../../commons/table/table.component';
import { QuizBuilderComponent } from '../quiz-builder/quiz-builder.component';
import { TableData } from '../../../models/table.interface';
import { Material, QuizField, QuizView } from '../../../models/academics.interface';
import { LearningMaterialsService } from '../../../services/academics/learningmaterial.service';
import { ApiHealthService } from '../../../services/api/api-health.service';
import { SessionStorageService } from '../../../services/storage/session-storage.service';
import { QuizService } from '../../../services/academics/quiz.service';
import { NotifyComponent } from '../../../commons/notify/notify.component';
import { NotificationService } from '../../../services/info/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizViewerComponent } from '../quiz-viewer/quiz-viewer.component';

@Component({
  selector: 'app-quiz',
  imports: [TableComponent, QuizBuilderComponent, QuizViewerComponent],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css',
})
export class QuizComponent implements OnInit {
  apiHealth = inject(ApiHealthService);
  learning = inject(LearningMaterialsService);
  notify = inject(NotificationService);
  quiz = inject(QuizService);
  sessionStorage = inject(SessionStorageService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  quizzesTable!: TableData;
  quizData?: QuizField;
  quizzes: any = [];
  materials?: Material[];
  apiNotHealthy:boolean = true;
  fetchedFromApi = false;
  errorMessage: string = "";
  user!: any;
  action: string | null = null;
  passedMaterial: boolean = false;
  takeQuiz?: QuizView;

  ngOnInit(): void {
    this.user = this.sessionStorage.getItem("User");
    this.getMaterials();

    this.apiHealth.isHealthy$.subscribe(
      (isHealthy: boolean) => {
        this.apiNotHealthy = !isHealthy;

        if (isHealthy){
          if(!this.fetchedFromApi){
            this.getQuizzes();
          }
        }else{
          if (this.quizzes[0]?.guid){
            return;
          }

          try {
            this.quizzes = this.sessionStorage.getItem("Quizzes");
          } catch (error) {
            console.log(
              "Error getting Quizzes from session storage: ",
              error
            );
          }
        }
      }
    );
  }

  getPassedMaterial(){
    if (
      this.materials?.length &&
      this.quizzes?.length &&
      !this.passedMaterial
    ){
      this.route.queryParamMap.subscribe(
        (param: any) => {
          const materialGuid = param.get('guid');

          if(materialGuid) this.getMaterialQuiz(materialGuid);

          this.passedMaterial = true;

          // Remove guid from URL
          this.router.navigate(
            [],
            {
              relativeTo: this.route,
              queryParams: { guid: null },
              queryParamsHandling: 'merge',
              replaceUrl: true
            }
          );
        }
      );
    }
  }

  getQuizzes(){
    this.quiz.getQuizzes().subscribe(
      (resp: any) => {
        if (resp.table && resp.response) {
          this.quizzesTable = resp.table;
          this.quizzes = resp.response;

          this.getPassedMaterial();
        }
      }
    );
  }

  createQuiz() {
    this.quizData = {
      material: {
        options: this.materials ?? []
      }
    }
  }

  getMaterialQuiz(materialGuid: string){
    const materialQuiz = this.quizzes.find(
      (quiz:any) => quiz.learning_material === materialGuid
    );

    console.log({materialGuid, materialQuiz})

    if(materialQuiz) {
      this.onActionClick({action: 'View', row: materialQuiz});
    }else {
      const material = this.materials?.find(
        (material) => material.guid === materialGuid
      );

      this.quizData = {
        material: {
          material: material,
          options: this.materials ?? []
        }
      };
    }
  }

  getMaterials(){
    if (this.materials && this.materials.length > 0){
      this.getPassedMaterial();
      return;
    }

    try {
      this.materials = this.setMaterials(
        this.sessionStorage.getItem("LearningMaterials")
      );

      this.getPassedMaterial();
    } catch (error) {
      this.quiz.getMaterials().subscribe(
        (resp: any) => {
          this.materials = resp ? this.setMaterials(resp) : [];

          this.getPassedMaterial();
        }
      );
    }
  }

  onRowClick(row: any){
    this.action = null;

    let data = this.quiz.getQuiz(row.guid, this.quizzes);
    data['timer'] = data.raw?.timer;

    const {material, ...viewQuiz} = data;

    this.takeQuiz = viewQuiz;
  }

  onActionClick(event: {action: string, row: any}) {
    const {action, row} = event;
    let data = this.quiz.getQuiz(row.guid, this.quizzes);

    data.material['options'] = this.materials;

    this.action = action ? action : null;

    if (data){
      if(this.action === 'Delete'){
        data.deletable = true;

      }

      if(action === 'Qns'){
        data['questions'] = undefined;
      }

      this.quizData = data;
    }
  }

  onClose() {
    this.quizData = undefined;
  }

  onCloseTakenQuiz() {
    this.takeQuiz = undefined;
  }

  onSaveTakenQuiz(data: any) {
    this.takeQuiz = undefined;
  }

  onDelete(guid: string) {
    this.quizData = undefined;

    if(guid){
      this.quiz.deleteQuiz(guid).subscribe({
        next: () => {
          this.notify.showSuccess('Quiz deleted successfully');

          this.getQuizzes();
          this.quizData = undefined;
        },
        error: (err) => {
          this.notify.showError(JSON.stringify(err.error));
        }
      })
    }
  }

  onSave(data: any) {
    let apiData = this.quiz.prepareApiData(data, this.user.guid);

    this.quiz.saveQuiz(apiData).subscribe({
      next: () => {
        this.notify.showSuccess('Quiz successfully created/updated');

        this.getQuizzes();
        this.quizData = undefined;
      },
      error: (err) => {
        this.notify.showError(JSON.stringify(err.error));
      }
    })
  }

  onUpdate(data: any) {
    const quizData = this.quiz.prepareUpdateData(data, this.user.guid);

    if (quizData){
      this.quiz.updateQuiz(quizData).subscribe(
        {
          next: () => {
            this.notify.showSuccess('Quiz updated successfully');

            this.getQuizzes();
            this.quizData = undefined;
          },
          error: (err: any) => {
            this.notify.showError(JSON.stringify(err?.error));
          }
        }
      );
    }
  }

  setMaterials(response: any[]): Material[] {
    return response
      .filter((resp) => resp.type === 'quiz')
      .map((resp) => ({
          title: resp.title,
          guid: resp.guid,
          raw: resp
        })
      );
  }

}
