import { BaseModel, DEFAULT_BASE_MODEL } from "./base-model.interface";
import { SelectOption } from "./details.interface";


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

export interface Answer {
    text: string;
    is_correct: boolean;
    raw?: any
}

export interface Question {
    text: string;
    question_type?: any;
    raw?: any
    answers?: Answer[]
}

export interface Material {
    title?: string;
    guid?: any;
    raw?: any
}

export interface MaterialOptions {
    material?: Material;
    options: Material[];
}

export interface QuizField {
    guid?: string;
    raw?: any;
    material: MaterialOptions;
    questions?: Question[];
    deletable?: boolean;
}

export interface QuizView {
    timer?: number;
    guid: string;
    raw?: any;
    questions: Question[];
}
