import { DatabaseSync } from 'node:sqlite'; import path from 'node:path'; import fs from 'node:fs'; import { SourceDocument, StudyGuide, Flashcard, QuizQuestion, AudioOverview, SlideDeck, ChatMessage } from './types'; const dbDir = path.resolve(process.cwd(), 'data'); if (!fs.existsSync(dbDir)) { fs.mkdirSync(dbDir, { recursive: true }); }
const dbPath = path.join(dbDir, 'notebook.db'); let dbInstance: any = null; function getDb() { if (!dbInstance) { dbInstance = new DatabaseSync(dbPath); try { dbInstance.exec('PRAGMA journal_mode = WAL;'); dbInstance.exec('PRAGMA busy_timeout = 5000;'); } catch { } dbInstance.exec(`
CREATE TABLE IF NOT EXISTS sources (
id TEXT PRIMARY KEY, clientId TEXT DEFAULT 'device_default', name TEXT NOT NULL, type TEXT NOT NULL, content TEXT NOT NULL, wordCount INTEGER DEFAULT 0, charCount INTEGER DEFAULT 0, uploadedAt TEXT NOT NULL, selected INTEGER DEFAULT 1, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
); CREATE TABLE IF NOT EXISTS study_materials (
id TEXT PRIMARY KEY, clientId TEXT DEFAULT 'device_default', type TEXT NOT NULL, data TEXT NOT NULL, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
); CREATE TABLE IF NOT EXISTS chat_messages (
id TEXT PRIMARY KEY, clientId TEXT DEFAULT 'device_default', role TEXT NOT NULL, content TEXT NOT NULL, citations TEXT, timestamp TEXT NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
); CREATE TABLE IF NOT EXISTS settings (
key TEXT PRIMARY KEY, value TEXT NOT NULL
); `); try { dbInstance.exec("ALTER TABLE sources ADD COLUMN clientId TEXT DEFAULT 'device_default';"); } catch {} try { dbInstance.exec("ALTER TABLE study_materials ADD COLUMN clientId TEXT DEFAULT 'device_default';"); } catch {} try { dbInstance.exec("ALTER TABLE chat_messages ADD COLUMN clientId TEXT DEFAULT 'device_default';"); } catch {} }
return dbInstance; } export const notebookDb = { getSources(clientId: string = 'device_default'): SourceDocument[] { const db = getDb(); const rows = db.prepare('SELECT * FROM sources WHERE clientId = ? ORDER BY createdAt ASC').all(clientId) as any[]; return rows.map((r: any) => ({ id: r.id, name: r.name, type: r.type, content: r.content,
wordCount: Number(r.wordCount) || 0, charCount: Number(r.charCount) || 0, uploadedAt: r.uploadedAt, selected: Boolean(r.selected), })); }, getSourceById(id: string, clientId: string = 'device_default'): SourceDocument | null { const db = getDb();
const r = db.prepare('SELECT * FROM sources WHERE id = ? AND clientId = ?').get(id, clientId) as any; if (!r) return null; return { id: r.id, name: r.name, type: r.type, content: r.content, wordCount: Number(r.wordCount) || 0, charCount: Number(r.charCount) || 0, uploadedAt: r.uploadedAt, selected: Boolean(r.selected), }; },
saveSource(source: SourceDocument, clientId: string = 'device_default') { const db = getDb(); const stmt = db.prepare(`
INSERT INTO sources (id, clientId, name, type, content, wordCount, charCount, uploadedAt, selected)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
clientId = excluded.clientId, name = excluded.name, type = excluded.type, content = excluded.content, wordCount = excluded.wordCount, charCount = excluded.charCount, uploadedAt = excluded.uploadedAt, selected = excluded.selected
`); stmt.run(
source.id, clientId, source.name, source.type, source.content, source.wordCount, source.charCount, source.uploadedAt, source.selected ? 1 : 0
); return source; }, deleteSource(id: string, clientId: string = 'device_default') { const db = getDb(); db.prepare('DELETE FROM sources WHERE id = ? AND clientId = ?').run(id, clientId); return { success: true, id }; }, clearAllSources(clientId: string = 'device_default') { const db = getDb();
db.prepare('DELETE FROM sources WHERE clientId = ?').run(clientId); return { success: true }; }, updateSourceSelection(id: string, selected: boolean, clientId: string = 'device_default') { const db = getDb(); db.prepare('UPDATE sources SET selected = ? WHERE id = ? AND clientId = ?').run(selected ? 1 : 0, id, clientId);
return { success: true }; }, toggleSelectAllSources(selected: boolean, clientId: string = 'device_default') { const db = getDb(); db.prepare('UPDATE sources SET selected = ? WHERE clientId = ?').run(selected ? 1 : 0, clientId); return { success: true }; }, getMaterial<T>(type: string, clientId: string = 'device_default'): T | null {
const db = getDb(); const row = db.prepare('SELECT data FROM study_materials WHERE type = ? AND clientId = ?').get(type, clientId) as any; if (!row || !row.data) return null; try { return JSON.parse(row.data) as T; } catch { return null; } }, saveMaterial(type: string, data: any, clientId: string = 'device_default') { const db = getDb();
const id = `${clientId}_${type}`; const stmt = db.prepare(`
INSERT INTO study_materials (id, clientId, type, data, updatedAt)
VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
ON CONFLICT(id) DO UPDATE SET
data = excluded.data, updatedAt = CURRENT_TIMESTAMP
`); stmt.run(id, clientId, type, JSON.stringify(data)); return data; }, getAllMaterials(clientId: string = 'device_default') { return { studyGuide: this.getMaterial<StudyGuide>('studyGuide', clientId), flashcards: this.getMaterial<Flashcard[]>('flashcards', clientId), quiz: this.getMaterial<QuizQuestion[]>('quiz', clientId),
audioOverview: this.getMaterial<AudioOverview>('audioOverview', clientId), slideDeck: this.getMaterial<SlideDeck>('slideDeck', clientId), }; }, getChatMessages(clientId: string = 'device_default'): ChatMessage[] { const db = getDb();
const rows = db.prepare('SELECT * FROM chat_messages WHERE clientId = ? ORDER BY createdAt ASC').all(clientId) as any[]; return rows.map((r: any) => ({ id: r.id, role: r.role, content: r.content, citations: r.citations ? JSON.parse(r.citations) : undefined, timestamp: r.timestamp, })); },
saveChatMessage(msg: ChatMessage, clientId: string = 'device_default') { const db = getDb(); const stmt = db.prepare(`
INSERT INTO chat_messages (id, clientId, role, content, citations, timestamp)
VALUES (?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
clientId = excluded.clientId, content = excluded.content, citations = excluded.citations
`); stmt.run(
msg.id, clientId, msg.role, msg.content, msg.citations ? JSON.stringify(msg.citations) : null, msg.timestamp
); return msg; }, clearChatMessages(clientId: string = 'device_default') { const db = getDb(); db.prepare('DELETE FROM chat_messages WHERE clientId = ?').run(clientId); return { success: true }; }, getStatus(clientId: string = 'device_default') { const db = getDb();
const clientSourceCount = (db.prepare('SELECT COUNT(*) as c FROM sources WHERE clientId = ?').get(clientId) as any)?.c || 0; const totalAllSources = (db.prepare('SELECT COUNT(*) as c FROM sources').get() as any)?.c || 0; return { connected: true, database: 'SQLite (node:sqlite native)', path: dbPath, currentClientId: clientId,
deviceSources: clientSourceCount, totalSourcesAllDevices: totalAllSources, }; } };