export interface Person {
    account_status: string;
    address: any[];
    created_at: string;
    created_by: string;
    date_of_birth: string;
    first_name: string;
    gender: string;
    guid: string;
    last_name: string;
    phone: any[];
    updated_at: string;
    updated_by: string;
    user: {
        username: string | null;
        email: string | null;
        guid: string;
        is_active: boolean;
        is_superuser: boolean;
        last_login: string | null;
    };
  }