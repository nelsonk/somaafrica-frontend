export type TableCellValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export interface TableHeader {
  label: string;
  key: string;
  sortable?: boolean;
  hide?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction {
  label: string;
  tooltip?: string;
  icon?: string;
  class?: string; // btn-primary, btn-danger etc.
}

export interface TableRow {
  [key: string]: TableCellValue | TableAction[];
  actions: TableAction[];
}

export interface TableData {
  caption?: string;
  headers: TableHeader[];
  rows: TableRow[];
  pageSize?: number;
}

export interface TableResponse{
  table?: TableData;
  response?: any;
}

export const ACTION_EDIT: TableAction[] = [
  {
    label: 'Edit',
    icon: 'bi bi-pencil',
    class: 'btn-outline-primary'
  }
]

export const ACTIONS: TableAction[] = [
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

export const SAMPLE_TABLE_DATA: TableData = {
  caption: 'User Directory',
  pageSize: 5,
  headers: [
    { label: 'Name', key: 'name', sortable: true },
    { label: 'Role', key: 'role' },
    { label: 'Email', key: 'email', sortable: true }
  ],
  rows: [
    {
      name: 'Alice',
      role: 'Admin',
      email: 'alice@example.com',
      actions: ACTIONS
    },
    {
      name: 'Bob',
      role: 'User',
      email: 'bob@example.com',
      actions: ACTIONS
    },
    {
      name: 'Carol',
      role: 'Editor',
      email: 'carol@example.com',
      actions: ACTIONS
    },
    {
      name: 'Dan',
      role: 'User',
      email: 'dan@example.com',
      actions: ACTIONS
    },
    {
      name: 'Eve',
      role: 'Moderator',
      email: 'eve@example.com',
      actions: ACTIONS
    },
    {
      name: 'Frank',
      role: 'Admin',
      email: 'frank@example.com',
      actions: ACTIONS
    },
  ]
};
