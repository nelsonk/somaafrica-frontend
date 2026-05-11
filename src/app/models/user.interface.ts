import { TimeStampModel, DEFAULT_TIMESTAMP_MODEL } from "./base-model.interface";

export interface User extends TimeStampModel{
    username: string | null;
    email: string | null;
    guid: string;
    groups: any[];
    is_active: boolean;
    is_superuser: boolean;
    last_login: string | null;
}

export const DEFAULT_USER: User = {
  ...DEFAULT_TIMESTAMP_MODEL,
  username: null,
  email: null,
  guid: 'ghshshjjsjsjkskksskjsnbjsdbbdbjd',
  groups: [],
  is_active: false,
  is_superuser: false,
  last_login: null,
};

export interface BaseResponse {
  guid?: any;
  detail?: any;
  status?: any;
  error?: any;
}

export interface TokenResponse extends BaseResponse{
  access?: string;
  refresh?: string;
}
