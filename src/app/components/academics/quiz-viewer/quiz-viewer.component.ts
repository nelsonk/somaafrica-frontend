import { Component, OnInit, output, input, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { Question, QuizView } from '../../../models/academics.interface';

@Component({
  selector: 'app-quiz-viewer',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './quiz-viewer.component.html',
  styleUrl: './quiz-viewer.component.css',
})
export class QuizViewerComponent implements OnInit, OnDestroy {
  quizData = input.required<QuizView>();
  save = output<any>();
  close = output<void>();

  private fb = inject(FormBuilder);

  questionsData: Question[] = [];
  quizzes!: QuizView;
  quizForm!: FormGroup;
  timer?: number;
  timer_started = false;
  submitted = false;
  score = 0;
  totalQuestions = 0;
  percentage = 0;
  timeRemaining = 0;
  private intervalId?: number;

  ngOnInit(): void {
    this.quizzes = this.quizData();
    this.questionsData = this.quizzes.questions;
    this.timer = this.quizzes?.timer;
    this.totalQuestions = this.questionsData.length;

    this.quizForm = this.fb.group({
      questions: this.fb.array(
        this.questionsData.map(q =>
          this.createQuestionFromData(q)
        )
      )
    });

    this.startTimer();
  }

  ngOnDestroy(): void {
      this.clearTimer();
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  answers(questionIdex: number): FormArray{
    return this.questions.at(questionIdex).get('answers') as FormArray;
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

  createQuestionFromData(question: any): FormGroup {
    const group = this.fb.group(
      {
        text: [question.text],
        question_type: [question.question_type],
        raw: [question.raw],
        answers: this.fb.array(
          question.answers.map((answer: any) =>
            this.createAnswerFromData(answer)
          )
        )
      }
    );

    group.setValidators(
      this.questionAnsweredValidator()
    );

    return group;
  }

  createAnswerFromData(answer: any): FormGroup {
    return this.fb.group({
      text: [answer.text],
      is_correct: [answer.is_correct],
      selected: [false],
      raw: [answer.raw]
    });
  }

  questionAnsweredValidator():
  ValidatorFn {

    return (
      control: AbstractControl
    ): ValidationErrors | null => {

      const answers = control.get('answers') as FormArray;

      const selected = answers.controls.some(
        answer => answer.get(
          'selected'
        )?.value
      );

      return selected
        ? null
        : { noAnswer: true };
    };
  }

  selectSingleAnswer(questionIndex: number, answerIndex: number): void {
    const answers = this.answers(questionIndex);

    answers.controls.forEach(
      (control, index) => {
        control.patchValue({selected: index === answerIndex});
      }
    );
  }

  submitQuiz(): void {
    this.quizForm.markAllAsTouched();

    // if (this.quizForm.invalid) return;

    this.submitted = true;
    this.clearTimer();

    let score = 0;

    this.questions.controls.forEach(
      question => {
        const answers = question.get('answers') as FormArray;

        const correct = answers.controls.every(
          answer => {
            const selected = answer.get('selected')?.value;
            const isCorrect = answer.get('is_correct')?.value;

            return (selected === isCorrect);
          }
        );

        if (correct) {
          score++;
        }
      }
    );

    this.score = score;

    this.percentage = Math.round(
      (
        score /
        this.totalQuestions
      ) * 100
    );
  }

  saveQuiz() {
    this.timer_started = false;

    this.save.emit({
      score: this.score,
      totalQuestions: this.totalQuestions,
      percentage: this.percentage,
      answers: this.quizForm.getRawValue()
    });
  }

  retakeQuiz(): void {
    this.submitted = false;
    this.timer_started = false;
    this.score = 0;
    this.percentage = 0;

    this.questions.controls.forEach(
      question => {
        const answers = question.get('answers') as FormArray;

        answers.controls.forEach(
          answer => {
            answer.patchValue({
              selected: false
            });
          }
        );
      }
    );

    this.quizForm.markAsUntouched();

    this.startTimer();
  }

  startTimer(): void {
    if (!this.timer || this.submitted) return;

    this.clearTimer();

    this.timeRemaining = this.timer * 60;

    this.intervalId = window.setInterval(() => {
      this.timeRemaining--;

      if (this.timeRemaining <= 0) {
        this.submitQuiz();

        this.clearTimer();
      }

    }, 1000);
  }

  clearTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  get formattedTime(): string {
    const mins = Math.floor(this.timeRemaining / 60);

    const secs = this.timeRemaining % 60;

    return `${mins}:${secs
      .toString()
      .padStart(2, '0')}`;
  }

}
