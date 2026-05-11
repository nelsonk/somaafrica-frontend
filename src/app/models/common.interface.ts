export interface CrudOptions {
    config?: {};  /* Default to {retry=3, timeout=30000, bypass=false}, for httpContextTokens */
    save_as?: string; /* setItem in storage */
    remove?: string; /* removeItem from storage */
}