export interface Setting { key: string; value: string }
export interface HistoryEntry { id: number; profile_id: number; url: string; title: string; favicon: string | null; visited_at: string }
export interface Bookmark { id: number; profile_id: number; folder_id: number | null; title: string; url: string; favicon: string | null; position: number; created_at: string; updated_at: string }
export interface BookmarkFolder { id: number; profile_id: number; parent_id: number | null; name: string; created_at: string; updated_at: string }
export interface SearchEngine { id: number; profile_id: number; name: string; search_url: string; keyword: string; is_default: number; is_builtin: number; created_at: string; updated_at: string }
