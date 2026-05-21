import { User, DEFAULT_USER } from "./user.interface";
import { BaseModel, DEFAULT_BASE_MODEL } from "./base-model.interface";


export interface Address extends BaseModel{
  address: string;
}

export interface Phone extends BaseModel{
  number: string;
}

export interface Person extends BaseModel{
  account_status: string;
  address: Address[];
  date_of_birth: string;
  first_name: string;
  last_name: string;
  gender: string;
  photo?: string | null;
  phone: Phone[];
  user: User;
}

export const ADDRESS: Address = {
  ...DEFAULT_BASE_MODEL,
  address: ''
};

export const PHONE: Phone = {
  ...DEFAULT_BASE_MODEL,
  number: ''
};

  // ✅ Default values
export const DEFAULT_PERSON: Person = {
  ...DEFAULT_BASE_MODEL,
  account_status: '',
  address: [ { ...ADDRESS } ],
  date_of_birth: '',
  first_name: '',
  gender: '',
  last_name: '',
  photo: null,
  phone: [ { ...PHONE } ],
  user: { ...DEFAULT_USER },
};
