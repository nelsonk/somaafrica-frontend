import { BaseModel, DEFAULT_BASE_MODEL } from "./base-model.interface";


export interface EducationLevel extends BaseModel{
    level: string;
}

export interface Curriculum extends BaseModel{
    name: string;
}

export interface Subject extends BaseModel{
    name: string;
}

export const DEFAULT_EDUCATION_LEVEL: EducationLevel = {
    ...DEFAULT_BASE_MODEL,
    level: ''
};

export const DEFAULT_CURRICULUM: Curriculum = {
    ...DEFAULT_BASE_MODEL,
    name: ''
};

export const DEFAULT_SUBJECT: Subject = {
    ...DEFAULT_BASE_MODEL,
    name: ''
};
