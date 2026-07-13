import express from "express"

import database from "../database/database.js"

const router = express.Router()

router.get("/", (request, response) => {
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

export default router