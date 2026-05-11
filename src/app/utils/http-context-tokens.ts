import { HttpContextToken } from '@angular/common/http';
export const BYPASS_AUTH_TOKEN = new HttpContextToken(() => false);
export const RETRY_COUNT = new HttpContextToken(() => 3);
export const REQUEST_TIMEOUT = new HttpContextToken(() => 30000)
