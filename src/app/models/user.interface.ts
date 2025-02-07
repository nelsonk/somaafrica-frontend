export interface User {
    username: string | null;
    email: string | null;
    guid: string;
    is_active: boolean;
    is_superuser: boolean;
    last_login: string | null;
}