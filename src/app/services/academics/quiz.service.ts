import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../info/notification.service';
import { CrudService } from '../api/crud.service';
import { ACTION_EDIT } from '../../models/table.interface';
import { TableResponse } from '../../models/table.interface';
import { Observable, map, of, catchError } from 'rxjs';
import { User } from '../../models/user.interface';
import { SessionStorageService } from '../storage/session-storage.service';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  crud = inject(CrudService);
  notify = inject(NotificationService);
  sessionStorage = inject(SessionStorageService);

  materialsUrl = `${environment.BASE_URL}/academics/material`;
  quizUrl = `${environment.BASE_URL}/academics/quiz`;
  user = this.sessionStorage.getItem('User');

  getQuizzes():Observable<TableResponse>{
    let quizzesTable: any = '';
    let quizzes: any = '';

    return this.crud.get(
      this.quizUrl, {save_as: 'Quizzes'}
    ).pipe(
      map((response: any) =>
        ({
          table: this.setQuizzesTable(response),
          response: response
        })
      ),
      catchError ((er:any) => {
        this.notify.showError(JSON.stringify(er?.error));

        return of({
          table: quizzesTable,
          response: quizzes
        });
      })
    );
  }

  setQuizzesTable(response: any){
    const HEADERS = [
      {label: 'GUID', key: 'guid', hide: true},
      { label: 'Title', key: 'title', sortable: true },
      { label: 'Questions', key: 'questions', sortable: true },
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
    const quizRows = response.map((resp:any) => {
      const is_super_user = this.user.is_superuser;
      let actions = [...ACTION_EDIT];

      if(is_super_user){
        actions = [
          ...actions,
          {
            label: 'Delete',
            icon: 'bi bi-trash',
            class: 'btn-outline-danger'
          }
        ]
      }

      return {
        guid: resp.guid,
        title: resp?.material?.title,
        questions: resp?.questions.length,
        price: resp.material?.price,
        currency: resp.material?.currency?.currency,
        classes: resp.material?.classes.map((s:any) => s?.name).join(', '),
        actions: [
          {
            label: 'Qns',
            icon: 'bi bi-plus-lg',
            class: 'btn-outline-success'
          },
          ...actions
        ]
      };

    });

    return {
      caption: 'Quizzes',
      pageSize: 10,
      headers: HEADERS,
      rows: quizRows
    };
  }

  getQuiz(guid: string, quizzes: any): any {
    for (let quiz of quizzes) {
      if (quiz.guid == guid){
        const materialOptions = {
          material: {
            title: quiz.material.title,
            guid: quiz.material.guid,
            raw: quiz.material,
          }
        };

        let questions = quiz.questions.map((question: any) => {
          let answers = question.answers.map((answer: any) => {
            return {
              text: answer.text,
              is_correct: answer.is_correct,
              raw: answer
            };
          });

          return {
            text: question.text,
            question_type: question.question_type,
            raw: question,
            answers: answers
          };
        });

        return {
          guid: guid,
          raw: quiz,
          material: materialOptions,
          questions: questions
        };
      }
    }

    return
  }

  getMaterials():Observable<any>{
    return this.crud.get(
      this.materialsUrl, {save_as: 'LearningMaterials'}
    );
  }

  saveQuiz(data: any): Observable<any>{
    return this.crud.create(this.quizUrl, data);
  }

  updateQuiz(data: any): Observable<any>{
    return this.crud.update(`${this.quizUrl}/${data.guid}`, data);
  }

  deleteQuiz(guid: string): Observable<any>{
    return this.crud.delete(`${this.quizUrl}/${guid}`);
  }

  prepareUpdateData(data:any, user_guid: User){
    let addQuestionsAnswers: any[] = [];
    let updateData: Record<string, any> | null = null;

    let questions: any[] = data.questions.map((question: any) => {
      if (!question.raw) {
        question['quiz'] = data.guid;
        question['created_by'] = user_guid;
        question['updated_by'] = user_guid;

        question.answers = question.answers.map((answer: any) => {
          answer['created_by'] = user_guid;
          answer['updated_by'] = user_guid;

          return answer;
        });

        addQuestionsAnswers.push(question);

        return
      }

      question.raw.text = question.text;
      question.raw.question_type = question.question_type;
      question.raw.updated_by = user_guid;

      question.raw.answers = question.answers.map((answer: any) => {
        if(!answer.raw){
          answer['question'] = question.raw.guid;
          answer['created_by'] = user_guid;
          answer['updated_by'] = user_guid;

          return answer;
        }

        answer.raw.text = answer.text;
        answer.raw.is_correct = answer.is_correct;
        answer.raw.updated_by = user_guid;

        return answer.raw;
      });

      return question.raw;
    }).filter(
      (question: any) => question !== undefined
    );

    updateData = {
      questions: [...questions, ...addQuestionsAnswers],
      guid: data.guid,
      learning_material: data.material.guid,
      updated_by: user_guid
    };

    return updateData;
  }

  prepareApiData(data:any, user_guid: User){
    const questions = Array.isArray(data.questions)
      ? data.questions.map(
        (question: any) => {
          question.created_by = question?.created_by ?? user_guid;
          question.updated_by = user_guid;

          Array.isArray(question.answers)
            ? question.answers.map(
              (answer: any) => {
                answer.created_by = answer?.created_by ?? user_guid;
                answer.updated_by = user_guid;

                return answer;
              }
            )
            : []

          return question;
        }
      )
      : [];

    return {
      created_by: user_guid,
      updated_by: user_guid,
      learning_material: data.material.guid,
      questions: questions
    };
  }

}
