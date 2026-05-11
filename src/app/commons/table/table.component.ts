import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TableData, TableHeader, TableRow } from '../../models/table.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit, OnChanges{
  @Input() tableData!: TableData;
  @Input() headerLength!: number;
  @Output() rowClicked = new EventEmitter<TableRow>();
  @Output() actionClicked = new EventEmitter<{action: string, row:TableRow}>();
  @Input() compact: boolean = false;

  paginatedRows: TableRow[] = [];
  currentPage = 1;
  pageSize = 10;
  sortKey: string | null = null;
  sortAsc = true;
  searchText: string = '';
  filteredRows: any[] = [];
  selectedRow: any = null;

  get totalPages(): number {
    return Math.ceil(this.filteredRows.length / this.pageSize);
  }

  get visibleHeaders() {
    const headerLength = this.compact ? 3 : this.headerLength ?? this.tableData.headers.length;
    return this.tableData.headers
      .slice(0, headerLength)
      .filter(h => !h.hide);
  }

  // To detect changes
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['tableData'] && this.tableData){
      this.filteredRows = this.tableData.rows;
      this.pageSize = this.tableData.pageSize || 10;
      this.currentPage = 1;
      this.paginate();
    }
  }

  ngOnInit(): void {
  }

  onSearch() {
    const search = this.searchText.toLowerCase();
    this.filteredRows = this.tableData.rows.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(search)
      )
    );
    this.currentPage = 1;
    this.paginate();
  }

  onSort(header: TableHeader) {
    if (!header.sortable) return;

    this.sortKey === header.key
      ? (this.sortAsc = !this.sortAsc)
      : (this.sortKey = header.key, this.sortAsc = true);

    this.filteredRows.sort((a, b) => {
      const valA = a[header.key];
      const valB = b[header.key];

      if (valA == null) return 1;
      if (valB == null) return -1;

      return this.sortAsc
        ? valA.toString().localeCompare(valB.toString())
        : valB.toString().localeCompare(valA.toString());
    });

    this.paginate();
  }

  paginate() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedRows = this.filteredRows.slice(start, end);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.paginate();
  }

  onRowClick(row: TableRow) {
    this.selectedRow = row;
    this.rowClicked.emit(row);
  }

  onActionClick(action: string, row: TableRow) {
    this.selectedRow = row;
    this.actionClicked.emit({action, row});
  }

}
