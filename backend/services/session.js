import {
  randomBytes
} from "node:crypto"

import database from "../database/database.js"

function getSessionHours() {
  const value = Number(
    process.env.SESSION_HOURS
  )

  if (!Number.isFinite(value) || value < 1) {
    return 24
  }

  return value
}

export function createSession(playerId) {
  const token = randomBytes(32).toString("hex")

  const createdAt = new Date()

  const expiresAt = new Date(
    createdAt.getTime() +
      getSessionHours() * 60 * 60 * 1000
  )

  database.prepare(`
    INSERT INTO sessions (
      token,
      player_id,
      expires_at,
      created_at
    )
    VALUES (?, ?, ?, ?)
  `).run(
    token,
    playerId,
    expiresAt.toISOString(),
    createdAt.toISOString()
  )

  return {
    token,
    expiresAt: expiresAt.toISOString()
  }
}

export function deleteSession(token) {
  database.prepare(`
    DELETE FROM sessions
    WHERE token = ?
  `).run(token)
}

export function deleteExpiredSessions() {
  database.prepare(`
    DELETE FROM sessions
    WHERE expires_at <= ?
  `).run(new Date().toISOString())
}

export function findSession(token) {
  deleteExpiredSessions()

  return database.prepare(`
    SELECT
      sessions.token,
      sessions.player_id,
      sessions.expires_at,
      players.username,
      players.balance,
      players.is_banned,
      players.created_at
    FROM sessions
    INNER JOIN players
      ON players.id = sessions.player_id
    WHERE sessions.token = ?
      AND sessions.expires_at > ?
      AND players.is_banned = 0
  `).get(
    token,
    new Date().toISOString()
  )
}