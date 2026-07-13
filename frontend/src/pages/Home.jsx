import { Link } from "react-router-dom"

export default function Home({
  player,
  settings
}) {
  const isLoggedIn = Boolean(player)

  const games = [
    {
      key: "blackjack",
      icon: "🃏",
      name: "Blackjack",
      description:
        "Get closer to 21 than the dealer without going over."
    },

    {
      key: "roulette",
      icon: "🎡",
      name: "Roulette",
      description:
        "Bet on a colour and spin the European roulette wheel.",
      featured: true
    },

    {
      key: "slots",
      icon: "🎰",
      name: "Slots",
      description:
        "Spin the reels and match symbols to win virtual chips."
    }
  ]

  return (
    <main className="content">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">
            COMMUNITY EVENT
          </span>

          <h2>
            {isLoggedIn
              ? `Welcome, ${player.username}`
              : "Welcome, please log in"}
          </h2>

          <p>
            {isLoggedIn
              ? "Play classic casino-style games using virtual chips and compete for the highest balance."
              : "Log in or create an account to receive virtual chips and play the casino games."}
          </p>

          <Link
            to={
              isLoggedIn
                ? "/roulette"
                : "/login"
            }
            className="primary-button"
          >
            {isLoggedIn
              ? "Enter casino"
              : "Log in or register"}
          </Link>
        </div>

        <div className="hero-symbol">
          🎲
        </div>
      </section>

      <section className="section-heading">
        <div>
          <span className="eyebrow">
            GAME LOBBY
          </span>

          <h2>Choose a game</h2>
        </div>
      </section>

      <section className="games">
        {games.map((game) => {
          const enabled =
            settings.games[game.key]

          const destination = !isLoggedIn
            ? "/login"
            : `/${game.key}`

          return (
            <article
              key={game.key}
              className={
                [
                  "game-card",
                  game.featured ? "featured" : "",
                  !enabled ? "game-disabled" : ""
                ]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {game.featured && enabled && (
                <div className="game-badge">
                  Popular
                </div>
              )}

              {!enabled && (
                <div className="game-closed-badge">
                  Temporarily closed
                </div>
              )}

              <div className="game-icon">
                {game.icon}
              </div>

              <div>
                <h3>{game.name}</h3>

                <p>
                  {enabled
                    ? game.description
                    : `${game.name} is not available at the moment.`}
                </p>
              </div>

              <Link
                to={destination}
                className={
                  enabled
                    ? "card-button"
                    : "card-button disabled-game-button"
                }
              >
                {!isLoggedIn
                  ? "Log in to continue"
                  : enabled
                    ? `Play ${game.name.toLowerCase()}`
                    : "View status"}
              </Link>
            </article>
          )
        })}
      </section>

      <section className="info-grid">
        <div className="info-card">
          <span>💰</span>

          <div>
            <h3>Virtual chips</h3>
            <p>No real money or cash prizes.</p>
          </div>
        </div>

        <div className="info-card">
          <span>🎯</span>

          <div>
            <h3>Bet limits</h3>

            <p>
              Bets range from {settings.minimumBet} to{" "}
              {settings.maximumBet} chips.
            </p>
          </div>
        </div>

        <div className="info-card">
          <span>🛡️</span>

          <div>
            <h3>Admin controlled</h3>

            <p>
              Game availability is managed live by the
              event administrators.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}