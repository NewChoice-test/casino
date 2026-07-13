import { DatabaseSync } from "node:sqlite"
import { mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const currentFile = fileURLToPath(import.meta.url)
const currentDirectory = dirname(currentFile)

const databaseDirectory = resolve(
  currentDirectory,
  "data"
)

mkdirSync(databaseDirectory, {
  recursive: true
})

const databasePath = resolve(
  databaseDirectory,
  "casino.db"
)

const database = new DatabaseSync(databasePath)

database.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    balance INTEGER NOT NULL DEFAULT 1000,
    is_banned INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,

    FOREIGN KEY (player_id)
      REFERENCES players(id)
      ON DELETE CASCADE
  ) STRICT;

  CREATE TABLE IF NOT EXISTS casino_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    blackjack_enabled INTEGER NOT NULL DEFAULT 1,
    roulette_enabled INTEGER NOT NULL DEFAULT 1,
    slots_enabled INTEGER NOT NULL DEFAULT 1,
    minimum_bet INTEGER NOT NULL DEFAULT 10,
    maximum_bet INTEGER NOT NULL DEFAULT 250,
    updated_at TEXT NOT NULL
  ) STRICT;

  CREATE INDEX IF NOT EXISTS sessions_player_id_index
    ON sessions(player_id);

  CREATE INDEX IF NOT EXISTS sessions_expires_at_index
    ON sessions(expires_at);
`)

const playerColumns = database
  .prepare("PRAGMA table_info(players)")
  .all()

const hasBannedColumn = playerColumns.some(
  (column) => column.name === "is_banned"
)

if (!hasBannedColumn) {
  database.exec(`
    ALTER TABLE players
    ADD COLUMN is_banned INTEGER NOT NULL DEFAULT 0;
  `)
}

database.prepare(`
  INSERT OR IGNORE INTO casino_settings (
    id,
    blackjack_enabled,
    roulette_enabled,
    slots_enabled,
    minimum_bet,
    maximum_bet,
    updated_at
  )
  VALUES (1, 1, 1, 1, 10, 250, ?)
`).run(new Date().toISOString())

export default database