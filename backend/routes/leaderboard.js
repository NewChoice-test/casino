import express from "express"

import database from "../database/database.js"

const router = express.Router()

router.get("/", (request, response) => {
  const players = database.prepare(`
    SELECT
      id,
      username,
      balance,
      created_at
    FROM players
    WHERE is_banned = 0
    ORDER BY balance DESC, created_at ASC
    LIMIT 50
  `).all()

  response.json({
    players: players.map((player, index) => ({
      rank: index + 1,
      id: player.id,
      username: player.username,
      balance: player.balance,
      createdAt: player.created_at
    })),
    updatedAt: new Date().toISOString()
  })
})

export default router