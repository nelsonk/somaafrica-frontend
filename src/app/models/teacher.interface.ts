import { BaseModel, DEFAULT_BASE_MODEL } from "./base-model.interface";
import { setDetail } from "../utils/details-helper";
import { Person, DEFAULT_PERSON } from "./person.interface";
import {
    EducationLevel,
    Curriculum,
    Subject,
    DEFAULT_EDUCATION_LEVEL,
    DEFAULT_CURRICULUM,
    DEFAULT_SUBJECT
} from "./academics.interface";


export interface Teacher extends BaseModel{
    person: string;
    person_details?: Person;
    education_levels: EducationLevel[];
    curriculums: Curriculum[];
    subjects: Subject[];
    summary: string;
    description?: string;
    years_of_experience?: string;
    qualifications: string;
    rating?: string;
}

export const DEFAULT_TEACHER: Teacher = {
    ...DEFAULT_BASE_MODEL,
    person: '',
    person_details: { ...DEFAULT_PERSON },
    education_levels: [ { ...DEFAULT_EDUCATION_LEVEL } ],
    curriculums: [ { ...DEFAULT_CURRICULUM } ],
    subjects: [ { ...DEFAULT_SUBJECT } ],
    summary: '',
    description: '',
    years_of_experience: '',
    qualifications: '',
    rating: ''
};

