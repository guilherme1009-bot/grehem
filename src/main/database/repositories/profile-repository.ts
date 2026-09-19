import type { SqliteDatabase } from '../connection'
export interface Profile { id: number; name: string; avatar: string | null; is_guest: number; created_at: string; updated_at: string }
export class ProfileRepository {
  constructor(private readonly db: SqliteDatabase) {}
  getDefault(): Profile { const profile = this.db.prepare('SELECT * FROM profiles WHERE is_guest = 0 ORDER BY id LIMIT 1').get() as Profile | undefined; if (profile) return profile; const result = this.db.prepare('INSERT INTO profiles (name) VALUES (?)').run('Perfil 1'); return this.db.prepare('SELECT * FROM profiles WHERE id = ?').get(result.lastInsertRowid) as Profile }
  create(name: string, guest = false): Profile { const value = name.trim(); if (!value) throw new Error('profile name must not be empty'); const result = this.db.prepare('INSERT INTO profiles (name, is_guest) VALUES (?, ?)').run(value, guest ? 1 : 0); return this.db.prepare('SELECT * FROM profiles WHERE id = ?').get(result.lastInsertRowid) as Profile }
}
