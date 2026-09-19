export const initialMigration = {
  version: 1,
  name: '001_initial',
  sql: `
    CREATE TABLE profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, avatar TEXT, is_guest INTEGER NOT NULL DEFAULT 0 CHECK (is_guest IN (0,1)), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE settings (id INTEGER PRIMARY KEY AUTOINCREMENT, profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, key TEXT NOT NULL, value TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(profile_id, key));
    CREATE TABLE history (id INTEGER PRIMARY KEY AUTOINCREMENT, profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, url TEXT NOT NULL, title TEXT NOT NULL DEFAULT '', favicon TEXT, visited_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE bookmark_folders (id INTEGER PRIMARY KEY AUTOINCREMENT, profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, parent_id INTEGER REFERENCES bookmark_folders(id) ON DELETE CASCADE, name TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE bookmarks (id INTEGER PRIMARY KEY AUTOINCREMENT, profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, folder_id INTEGER REFERENCES bookmark_folders(id) ON DELETE SET NULL, title TEXT NOT NULL, url TEXT NOT NULL, favicon TEXT, position INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE search_engines (id INTEGER PRIMARY KEY AUTOINCREMENT, profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, name TEXT NOT NULL, search_url TEXT NOT NULL, keyword TEXT NOT NULL, is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0,1)), is_builtin INTEGER NOT NULL DEFAULT 0 CHECK (is_builtin IN (0,1)), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(profile_id, keyword));
    CREATE INDEX idx_history_profile_visited ON history(profile_id, visited_at DESC);
    CREATE INDEX idx_history_url ON history(profile_id, url);
    CREATE INDEX idx_bookmarks_profile_position ON bookmarks(profile_id, position);
    CREATE INDEX idx_bookmarks_folder ON bookmarks(folder_id);
    CREATE INDEX idx_folders_profile_parent ON bookmark_folders(profile_id, parent_id);
    CREATE INDEX idx_search_engines_profile ON search_engines(profile_id);
    CREATE INDEX idx_settings_profile ON settings(profile_id);
  `
} as const
