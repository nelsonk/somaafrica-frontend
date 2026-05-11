
import { Component, Input, OnInit, Output } from '@angular/core';
import { DetailsData } from '../../models/details.interface';
import { TableComponent } from '../table/table.component';
import { EventEmitter } from '@angular/core';

@Component({
    selector: 'app-details-page',
    imports: [TableComponent],
    templateUrl: './details-page.component.html',
    styleUrl: './details-page.component.css'
})
export class DetailsPageComponent implements OnInit{
  @Input() detailsData!: DetailsData;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  activeTab = 0;
  imageError = false;

  get image(){
    return this.detailsData?.summary?.image;
  }

  get detailsTitle(){
    return this.detailsData?.detail?.title;
  }

  get mainSummary(): string {
    return String(
      Object.values(this.detailsData?.summary?.summary || {})[0]
    ) ?? '';
  }

  get otherSummaries(){
    return Object.entries(this.detailsData?.summary?.summary || {}).slice(1);
  }

  get details(){
    return Object.entries(this.detailsData?.detail?.details || {});
  }

  get tabsData(){
    return this.detailsData?.tabData;
  }

  ngOnInit(): void {}

}
