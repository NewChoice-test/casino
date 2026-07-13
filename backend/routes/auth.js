import express from "express"

import {
  randomUUID
} from "node:crypto"

import database from "../database/database.js"

import {
  hashPassword,
  verifyPassword
} from "../services/password.js"

import {
  createSession,
  deleteSession
} from "../services/session.js"

import {
  requireAuthentication
} from "../middleware/auth.js"

const router = express.Router()

function cleanUsername(value) {
  return String(value ?? "").trim()
}

function validateUsername(username) {
  if (username.length < 3) {
    return "Username must contain at least 3 characters."
  }

  if (username.length > 20) {
    return "Username cannot exceed 20 characters."
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return "Username may only contain letters, numbers, underscores, and hyphens."
  }

  return null
}

function validatePassword(password) {
  if (password.length < 8) {
    return "Password must contain at least 8 characters."
  }

  if (password.length > 100) {
    return "Password is too long."
  }

  return null
}

router.post(
  "/register",
  async (request, response, next) => {
    try {
      const username = cleanUsername(
        request.body.username
      )

      const password = String(
        request.body.password ?? ""
      )

      const usernameError =
        validateUsername(username)

      if (usernameError) {
        return response.status(400).json({
          error: usernameError
        })
      }

      const passwordError =
        validatePassword(password)

      if (passwordError) {
        return response.status(400).json({
          error: passwordError
        })
      }

      const existingPlayer =
        database.prepare(`
          SELECT id
          FROM players
          WHERE username = ?
        `).get(username)

      if (existingPlayer) {
        return response.status(409).json({
          error: "That username is already taken."
        })
      }

      const {
        salt,
        hash
      } = await hashPassword(password)

      const playerId = randomUUID()
      const now = new Date().toISOString()

      const startingBalance = Number(
        process.env.STARTING_BALANCE
      )

      const safeStartingBalance =
        Number.isFinite(startingBalance) &&
        startingBalance >= 0
          ? Math.floor(startingBalance)
          : 1000

      database.prepare(`
        INSERT INTO players (
          id,
          username,
          password_hash,
          password_salt,
          balance,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        playerId,
        username,
        hash,
        salt,
        safeStartingBalance,
        now,
        now
      )

      const session = createSession(playerId)

      return response.status(201).json({
        token: session.token,
        expiresAt: session.expiresAt,
        player: {
          id: playerId,
          username,
          balance: safeStartingBalance,
          createdAt: now
        }
      })
    } catch (error) {
      next(error)
    }
  }
)

router.post(
  "/login",
  async (request, response, next) => {
    try {
      const username = cleanUsername(
        request.body.username
      )

      const password = String(
        request.body.password ?? ""
      )

      const player = database.prepare(`
  SELECT
    id,
    username,
    password_hash,
    password_salt,
    balance,
    is_banned,
    created_at
  FROM players
  WHERE username = ?
`).get(username)

      if (!player) {
        return response.status(401).json({
          error: "Incorrect username or password."
        })
      }

      if (player.is_banned) {
  return response.status(403).json({
    error:
      "This player account has been banned."
  })
}

      const passwordIsValid =
        await verifyPassword({
          password,
          salt: player.password_salt,
          expectedHash: player.password_hash
        })

      if (!passwordIsValid) {
        return response.status(401).json({
          error: "Incorrect username or password."
        })
      }

      const session = createSession(player.id)

      return response.json({
        token: session.token,
        expiresAt: session.expiresAt,
        player: {
          id: player.id,
          username: player.username,
          balance: player.balance,
          createdAt: player.created_at
        }
      })
    } catch (error) {
      next(error)
    }
  }
)

router.get(
  "/me",
  requireAuthentication,
  (request, response) => {
    response.json({
      player: request.player
    })
  }
)

router.post(
  "/logout",
  requireAuthentication,
  (request, response) => {
    deleteSession(request.sessionToken)

    response.json({
      message: "Logged out successfully."
    })
  }
)

export default router