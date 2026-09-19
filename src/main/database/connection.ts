import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { initialMigration } from './migrations/001_initial'

export type SqliteDatabase = Database.Database

export class DatabaseConnection {
  readonly db: SqliteDatabase
  constructor(filename: string) {
    if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true })
    this.db = new Database(filename)
    this.db.pragma('foreign_keys = ON')
    this.db.pragma('journal_mode = WAL')
  }
  migrate(): void {
    this.db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)')
    if (!this.db.prepare('SELECT 1 FROM schema_migrations WHERE version = ?').get(initialMigration.version)) {
      this.db.transaction(() => {
        this.db.exec(initialMigration.sql)
        this.db.prepare('INSERT INTO schema_migrations (version, name) VALUES (?, ?)').run(initialMigration.version, initialMigration.name)
      })()
    }
  }
  close(): void { if (this.db.open) this.db.close() }
}
