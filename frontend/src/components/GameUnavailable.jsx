import { Link } from "react-router-dom"

const gameInformation = {
  blackjack: {
    icon: "🃏",
    name: "Blackjack",
    description:
      "The blackjack tables are temporarily closed."
  },

  roulette: {
    icon: "🎡",
    name: "Roulette",
    description:
      "The roulette wheel is temporarily unavailable."
  },

  slots: {
    icon: "🎰",
    name: "Slots",
    description:
      "The slot machines are temporarily offline."
  }
}

export default function GameUnavailable({
  game
}) {
  const information =
    gameInformation[game]

  return (
    <main className="content">
      <section className="unavailable-page">
        <div className="unavailable-glow" />

        <div className="unavailable-icon">
          {information.icon}
        </div>

        <span className="eyebrow">
          TEMPORARILY UNAVAILABLE
        </span>

        <h2>
          {information.name} is currently closed
        </h2>

        <p>
          {information.description}
        </p>

        <p className="unavailable-secondary-text">
          An administrator has temporarily disabled this
          game. Please check back again soon.
        </p>

        <div className="unavailable-actions">
          <Link
            to="/"
            className="primary-button"
          >
            Return to lobby
          </Link>

          <Link
            to="/leaderboard"
            className="unavailable-secondary-button"
          >
            View leaderboard
          </Link>
        </div>

        <div className="unavailable-status">
          <span className="unavailable-status-dot" />

          Table closed
        </div>
      </section>
    </main>
  )
}