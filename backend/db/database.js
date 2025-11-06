import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../data/infoswipe.db');
const db = new Database(dbPath);

export function initDatabase() {
  // 文章表
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      link TEXT UNIQUE,
      source TEXT,
      published_at TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      category TEXT DEFAULT 'pending',
      score REAL,
      score_details TEXT,
      dedupe_hash TEXT
    )
  `);

  // 操作历史表
  db.exec(`
    CREATE TABLE IF NOT EXISTS operations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER,
      action TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles(id)
    )
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_category ON articles(category);
    CREATE INDEX IF NOT EXISTS idx_dedupe_hash ON articles(dedupe_hash);
    CREATE INDEX IF NOT EXISTS idx_created_at ON articles(created_at);
  `);

  console.log('✅ Database initialized');
}

export function getDB() {
  return db;
}

