export interface TableHeader {
  label: string;
  key: string;
  sortable?: boolean;
  hide?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface TableRow {
  [key: string]: string | number | boolean | null | undefined;
}

export interface TableAction {
  label: string;
  tooltip?: string;
  icon?: string;
  class?: string; // btn-primary, btn-danger etc.
}

export interface TableData {
  caption?: string;
  headers: TableHeader[];
  rows: TableRow[];
  actions?: TableAction[];
  pageSize?: number;
}


export const SAMPLE_TABLE_DATA: TableData = {
  caption: 'User Directory',
  pageSize: 5,
  headers: [
    { label: 'Name', key: 'name', sortable: true },
    { label: 'Role', key: 'role' },
    { label: 'Email', key: 'email', sortable: true }
  ],
  rows: [
    { name: 'Alice', role: 'Admin', email: 'alice@example.com' },
    { name: 'Bob', role: 'User', email: 'bob@example.com' },
    { name: 'Carol', role: 'Editor', email: 'carol@example.com' },
    { name: 'Dan', role: 'User', email: 'dan@example.com' },
    { name: 'Eve', role: 'Moderator', email: 'eve@example.com' },
    { name: 'Frank', role: 'Admin', email: 'frank@example.com' },
  ],
  actions: [
    {
      label: 'Edit',
      icon: 'bi bi-pencil',
      class: 'btn-outline-primary'
    },
    {
      label: 'Delete',
      icon: 'bi bi-trash',
      class: 'btn-outline-danger'
    }
  ]
};
