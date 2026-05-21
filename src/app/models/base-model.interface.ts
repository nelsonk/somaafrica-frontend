export interface TimeStampModel {
    created_at?: string;
    updated_at?: string;
}

export interface UserTrackerModel {
    created_by?: string;
    updated_by?: string;
}

export interface BaseModel extends TimeStampModel, UserTrackerModel{
    guid?: string;
}

export const DEFAULT_TIMESTAMP_MODEL: TimeStampModel = {
    created_at: '',
    updated_at: ''
};

export const DEFAULT_USERTRACKER_MODEL: UserTrackerModel = {
    created_by: '',
    updated_by: ''
};

export const DEFAULT_BASE_MODEL: BaseModel = {
    guid: '',
    ...DEFAULT_TIMESTAMP_MODEL,
    ...DEFAULT_USERTRACKER_MODEL
};
