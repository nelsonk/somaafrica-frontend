import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, input, output } from '@angular/core';

import {
  FormArray,
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { QuizField, Question, Material } from '../../../models/academics.interface';


@Component({
  selector: 'app-quiz-builder',
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './quiz-builder.component.html',
  styleUrl: './quiz-builder.component.css',
})
export class QuizBuilderComponent implements OnInit{
  quizData = input.required<QuizField>();
  close = output<void>();
  save = output<any>();
  update = output<any>();
  delete = output<string>();

  private fb = inject(FormBuilder);

  questionsData: Question[] = [];
  options!: Material[];
  material?: Material;
  quizForm!: FormGroup;

  ngOnInit(){
    this.questionsData = this.quizData()?.questions || [];
    this.options = this.quizData().material.options;
    this.material = this.quizData().material?.material;

    this.quizForm = this.fb.group({
      material: [this.material ?? null, Validators.required],
      questions: this.fb.array(
        this.questionsData
        ? this.questionsData.map(q =>
            this.createQuestionFromData(q)
          )
        : []
      )
    });

    if (!this.questionsData?.length) this.addQuestion();
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  createAnswer(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      is_correct: [false]
    });
  }

  createQuestion(): FormGroup {
    return this.fb.group(
      {
        text: ['', Validators.required],
        question_type: ['single'],
        answers: this.fb.array([
          this.createAnswer(),
          this.createAnswer()
        ])
      },
      {
        validators: this.atLeastOneCorrectAnswer
      }
    );
  }

  answers(questionIdex: number): FormArray{
    return this.questions.at(questionIdex).get('answers') as FormArray;
  }

  addQuestion(){
    this.questions.push(this.createQuestion());

    setTimeout(() => {
      const cards = document.querySelectorAll('.question-card');

      cards[cards.length - 1]
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

    });
  }

  removeQuestion(questionIdex: number){
    if (this.questions.length === 1) return

    this.questions.removeAt(questionIdex);
  }

  addAnswer(questionIndex: number): void {
    this.answers(questionIndex).push(this.createAnswer());
  }

  removeAnswer(questionIndex: number, answerIndex: number): void {
    const answers = this.answers(questionIndex);

    if (answers.length <= 2) return;

    answers.removeAt(answerIndex);
  }

  selectCorrectAnswer(questionIndex: number, answerIndex: number): void {
    const answers = this.answers(questionIndex);

    answers.controls.forEach(
      (control, index) => {

        control.patchValue({
          is_correct: index === answerIndex
        });
      }
    );
  }

  atLeastOneCorrectAnswer(control: AbstractControl): ValidationErrors | null {
    const answers = control.get('answers');

    if (!answers) return null;

    const hasCorrect = answers.value.some(
        (answer: any) => answer.is_correct
      );

    return hasCorrect
      ? null
      : {
          noCorrectAnswer: true
        };
  }

  createQuestionFromData(question: any): FormGroup {
    return this.fb.group(
      {
        text: [question.text, Validators.required],
        question_type: [question.question_type],
        raw: [question.raw],
        answers: this.fb.array(
          question.answers.map((answer: any) =>
            this.createAnswerFromData(answer)
          )
        )
      },
      {
        validators: this.atLeastOneCorrectAnswer
      }
    );
  }

  createAnswerFromData(answer: any): FormGroup {
    return this.fb.group({
      text: [answer.text, Validators.required],
      is_correct: [answer.is_correct],
      raw: [answer.raw]
    });
  }

  // createMaterialFromData(material: any): FormGroup {
  //   return this.fb.group({
  //     title: [material.title, Validators.required],
  //     guid: [material.guid, Validators.required],
  //     raw: [material.raw]
  //   });
  // }

  saveQuiz(): void {
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();

      return;
    }

    this.save.emit(this.quizForm.getRawValue());

    /*
      send to API
    */
  }

  updateQuiz(){
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();

      return;
    }

    let returnData = {
      ...this.quizForm.getRawValue(),
      guid: this.quizData().guid
    }

    this.update.emit(returnData);
  }

  deleteQuiz(){
    this.delete.emit(this.quizData().guid ?? '');
  }

}
