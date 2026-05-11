import { TableData, SAMPLE_TABLE_DATA } from "./table.interface";

export interface Summary {
    image?: string;
    summary: Record<string, string | number | boolean>;
}

export interface Detail {
    title: string;
    details: Record<string, string | number | boolean>;
}

export interface TabData {
    title: string;
    tableData: TableData;
}

export interface DetailsData {
    summary: Summary;
    detail: Detail;
    tabData?: TabData[];
}

export const DEFAULT_SUMMARY: Summary = {
    image: '',
    summary: {}
};

export const DEFAULT_DETAIL: Detail = {
    title: '',
    details: {}
};

export const DEFAULT_TAB_DATA: TabData = {
    title: '',
    tableData: { ...SAMPLE_TABLE_DATA }
};

export const DEFAULT_DETAILS_DATA: DetailsData = {
    summary: { ...DEFAULT_SUMMARY },
    detail: { ...DEFAULT_DETAIL }
};
