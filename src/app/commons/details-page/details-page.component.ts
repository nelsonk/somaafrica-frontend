
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { DetailsData, DetailSaveData } from '../../models/details.interface';
import { TableComponent } from '../table/table.component';
import { ViewerComponent } from '../viewer/viewer.component';
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
    selector: 'app-details-page',
    imports: [TableComponent, ViewerComponent, ReactiveFormsModule, NgSelectModule],
    templateUrl: './details-page.component.html',
    styleUrl: './details-page.component.css'
})
export class DetailsPageComponent implements OnInit{
  @Input() detailsData!: DetailsData;
  @Input() action?: string | null;
  @Output() delete = new EventEmitter<DetailSaveData>();
  @Output() save = new EventEmitter<DetailSaveData>();
  @Output() close = new EventEmitter<void>();

  activeTab = 0;
  imageError = false;
  image? = '';
  mainSummary: any = [];
  otherSummaries: any = [];
  details: any = [];
  tabsData: any = [];
  detailsTitle? = '';
  document? = '';
  editable?: boolean = true;
  deletable?: boolean = false;
  callback?: string;

  form = new FormGroup({});

  ngOnInit(): void {
    this.image = this.detailsData?.summary?.image;
    this.editable = this.detailsData?.editable;
    this.deletable = this.detailsData?.deletable;
    this.callback = this.detailsData?.callback;
    this.document = this.detailsData?.detail?.document;
    this.detailsTitle = this.detailsData?.detail?.title;
    this.details = this.detailsData?.detail?.details || [];
    this.tabsData = this.detailsData?.tabData;

    const summaries = this.detailsData?.summary?.summary || [];

    this.mainSummary = summaries[0];

    if(this.action && this.action === 'Edit'){
      // this.otherSummaries = [];
      // this.details = [...summaries, ...this.details];

      this.otherSummaries = summaries;
    }else{
      this.otherSummaries = summaries.slice(1);
    }

    this.buildForm();
  }

  // Read file
  onFileSelected(event: Event, detailKey: any): void {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];

    this.details.map((detail:any) => {
      if(detail.key == detailKey){
        detail.value = file;
      }
    });
  }

  buildForm(): void {

    const controls: any = {};

    const allFields = [
      ...this.otherSummaries,
      ...this.details
    ];

    allFields.forEach(field => {

      if (field.readonly) {
        return;
      }

      const validators = [];

      if (field.type === 'boolean' && field.required) {
        validators.push(Validators.requiredTrue);
      }
      else if (field.required) {
        validators.push(Validators.required);
      }

      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      if (field.maxlength) {
        validators.push(
          Validators.maxLength(field.maxlength)
        );
      }

      controls[field.key] = new FormControl(
        field.value,
        validators
      );

    });

    this.form = new FormGroup(controls);

    // KEEP ORIGINAL OBJECTS UPDATED
    allFields.forEach(field => {

      this.form.get(field.key)?.valueChanges
        .subscribe(value => {

          field.value = value;

        });

    });

  }

  isInvalid(key: string): boolean {

    const control = this.form.get(key);

    return !!(
      control &&
      control.invalid &&
      control.touched
    );

  }

  getErrors(field: any): string[] {

    const control = this.form.get(field.key);

    if (!control?.errors || !control.touched) {
      return [];
    }

    const errors: string[] = [];

    if (control.errors['required']) {
      errors.push(`${field.label} is required`);
    }

    if (control.errors['email']) {
      errors.push('Invalid email');
    }

    if (control.errors['maxlength']) {
      errors.push(
        `Maximum ${field.maxlength} characters allowed`
      );
    }

    return errors;

  }

  formatMultiSelect(value: any): string {
    if (!Array.isArray(value)) return '';

    return value
      .map(x => x?.label ?? x?.name ?? x)
      .join(', ');
  }

  isEdit(): boolean {
    return this.action === 'Edit';
  }

  toggleSelectAll(detail: any) {
    const allValues = detail.options;

    const control = this.form.get(detail.key);

    if (this.isAllSelected(detail)) {
      control?.setValue([]);
    } else {
      control?.setValue([...allValues]);
    }
  }

  isAllSelected(detail: any): boolean {
    return detail.value?.length === detail.options?.length;
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.save.emit({
      'callback': this.callback,
      'summary': this.otherSummaries,
      'detail': this.details
    });
  }

  onEdit(){
    this.action = 'Edit';
    this.otherSummaries = this.detailsData?.summary?.summary || [];
    // this.details = [...this.otherSummaries, ...this.details];
    // this.otherSummaries = [];

    this.buildForm();
  }

  onDelete(){
    this.otherSummaries = this.detailsData?.summary?.summary || [];

    this.delete.emit({
      'callback': this.callback,
      'summary': this.otherSummaries,
      'detail': this.details
    });
  }
}
