import { HttpContextToken } from '@angular/common/http';
export const BYPASS_INTERCEPTOR = new HttpContextToken(() => false);
