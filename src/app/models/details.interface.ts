import { TableData, SAMPLE_TABLE_DATA } from "./table.interface";


export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'date'
  | 'email'
  | 'single-select'
  | 'multi-select'
  | 'object'
  | 'file'
  | 'readonly';

export interface SelectOption {
  label: string;
  value: any;
  raw?: any;
}

export interface DetailField {
  key: string;
  label: string;
  type: FieldType;
  value: any;
  options?: SelectOption[];
  children?: DetailField[];
  readonly?: boolean | null;
  required?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxlength?: number;
  fullwidth?: boolean;
}

export interface Detail {
  title: string;
  document?: string;
  details: DetailField[];
}

export interface Summary {
    image?: string;
    summary: DetailField[];
}

export interface TabData {
    title: string;
    tableData: TableData;
}

export interface DetailsData {
    editable?: boolean;
    deletable?: boolean;
    callback?: string;
    summary?: Summary;
    detail?: Detail;
    tabData?: TabData[];
}

export const DEFAULT_SUMMARY: Summary = {
    image: '',
    summary: []
};

export const DEFAULT_DETAIL: Detail = {
    title: '',
    details: []
};

export const DEFAULT_TAB_DATA: TabData = {
    title: '',
    tableData: { ...SAMPLE_TABLE_DATA }
};

export const DEFAULT_DETAILS_DATA: DetailsData = {
    summary: { ...DEFAULT_SUMMARY },
    detail: { ...DEFAULT_DETAIL }
};

export interface DetailSaveData {
    callback?: string;
    summary: any;
    detail: any;
}

export interface DetailRequest {
    data?: any,
    url?: string,
    model: string,
    column?: string
}
