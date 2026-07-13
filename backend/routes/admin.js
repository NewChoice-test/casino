import express from "express"

import database from "../database/database.js"

import {
  requireAdmin
} from "../middleware/admin.js"

const router = express.Router()

router.use(requireAdmin)

router.get("/verify", (request, response) => {
  response.json({
    authenticated: true
  })
})

router.get("/settings", (request, response) => {
  const settings = database.prepare(`
    SELECT
      blackjack_enabled,
      roulette_enabled,
      slots_enabled,
      minimum_bet,
      maximum_bet,
      updated_at
    FROM casino_settings
    WHERE id = 1
  `).get()

  response.json({
    settings: {
      games: {
        blackjack: Boolean(
          settings.blackjack_enabled
        ),

        roulette: Boolean(
          settings.roulette_enabled
        ),

        slots: Boolean(
          settings.slots_enabled
        )
      },

      minimumBet: settings.minimum_bet,
      maximumBet: settings.maximum_bet,
      updatedAt: settings.updated_at
    }
  })
})

router.patch("/settings", (request, response) => {
  const blackjack =
    request.body?.games?.blackjack === true

  const roulette =
    request.body?.games?.roulette === true

  const slots =
    request.body?.games?.slots === true

  const minimumBet = Number(
    request.body.minimumBet
  )

  const maximumBet = Number(
    request.body.maximumBet
  )

  if (
    !Number.isSafeInteger(minimumBet) ||
    minimumBet < 1
  ) {
    return response.status(400).json({
      error:
        "Minimum bet must be a positive whole number."
    })
  }

  if (
    !Number.isSafeInteger(maximumBet) ||
    maximumBet < minimumBet
  ) {
    return response.status(400).json({
      error:
        "Maximum bet must be equal to or greater than the minimum bet."
    })
  }

  const updatedAt = new Date().toISOString()

  database.prepare(`
    UPDATE casino_settings
    SET
      blackjack_enabled = ?,
      roulette_enabled = ?,
      slots_enabled = ?,
      minimum_bet = ?,
      maximum_bet = ?,
      updated_at = ?
    WHERE id = 1
  `).run(
    blackjack ? 1 : 0,
    roulette ? 1 : 0,
    slots ? 1 : 0,
    minimumBet,
    maximumBet,
    updatedAt
  )

  response.json({
    settings: {
      games: {
        blackjack,
        roulette,
        slots
      },

      minimumBet,
      maximumBet,
      updatedAt
    }
  })
})

router.get("/players", (request, response) => {
  const players = database.prepare(`
    SELECT
      id,
      username,
      balance,
      is_banned,
      created_at,
      updated_at
    FROM players
    ORDER BY created_at DESC
  `).all()

  response.json({
    players: players.map((player) => ({
      id: player.id,
      username: player.username,
      balance: player.balance,
      isBanned: Boolean(player.is_banned),
      createdAt: player.created_at,
      updatedAt: player.updated_at
    }))
  })
})

router.patch(
  "/players/:playerId/balance",
  (request, response) => {
    const playerId = request.params.playerId

    const action = String(
      request.body.action ?? ""
    )

    const amount = Number(
      request.body.amount
    )

    if (
      !["add", "remove", "set"].includes(action)
    ) {
      return response.status(400).json({
        error:
          "Action must be add, remove, or set."
      })
    }

    if (
      !Number.isSafeInteger(amount) ||
      amount < 0
    ) {
      return response.status(400).json({
        error:
          "Amount must be a positive whole number."
      })
    }

    const player = database.prepare(`
      SELECT
        id,
        username,
        balance,
        is_banned
      FROM players
      WHERE id = ?
    `).get(playerId)

    if (!player) {
      return response.status(404).json({
        error: "Player not found."
      })
    }

    let newBalance = player.balance

    if (action === "add") {
      newBalance = player.balance + amount
    }

    if (action === "remove") {
      newBalance = Math.max(
        0,
        player.balance - amount
      )
    }

    if (action === "set") {
      newBalance = amount
    }

    if (!Number.isSafeInteger(newBalance)) {
      return response.status(400).json({
        error: "The resulting balance is too large."
      })
    }

    const updatedAt = new Date().toISOString()

    database.prepare(`
      UPDATE players
      SET
        balance = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      newBalance,
      updatedAt,
      playerId
    )

    response.json({
      player: {
        id: player.id,
        username: player.username,
        balance: newBalance,
        isBanned: Boolean(player.is_banned),
        updatedAt
      }
    })
  }
)

router.patch(
  "/players/:playerId/ban",
  (request, response) => {
    const playerId = request.params.playerId

    const isBanned =
      request.body.isBanned === true

    const player = database.prepare(`
      SELECT
        id,
        username
      FROM players
      WHERE id = ?
    `).get(playerId)

    if (!player) {
      return response.status(404).json({
        error: "Player not found."
      })
    }

    const updatedAt = new Date().toISOString()

    database.prepare(`
      UPDATE players
      SET
        is_banned = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      isBanned ? 1 : 0,
      updatedAt,
      playerId
    )

    if (isBanned) {
      database.prepare(`
        DELETE FROM sessions
        WHERE player_id = ?
      `).run(playerId)
    }

    response.json({
      player: {
        id: player.id,
        username: player.username,
        isBanned,
        updatedAt
      }
    })
  }
)
router.delete(
  "/players/:playerId",
  (request, response) => {
    const playerId = request.params.playerId

    const player = database.prepare(`
      SELECT
        id,
        username
      FROM players
      WHERE id = ?
    `).get(playerId)

    if (!player) {
      return response.status(404).json({
        error: "Player not found."
      })
    }

    database.prepare(`
      DELETE FROM players
      WHERE id = ?
    `).run(playerId)

    response.json({
      message:
        `${player.username} and all associated account data were permanently deleted.`,

      deletedPlayer: {
        id: player.id,
        username: player.username
      }
    })
  }
)
export default router