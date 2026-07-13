import {
  useCallback,
  useEffect,
  useState
} from "react"

import {
  getLeaderboard
} from "../services/api"

function getRankDisplay(rank) {
  if (rank === 1) {
    return "🥇"
  }

  if (rank === 2) {
    return "🥈"
  }

  if (rank === 3) {
    return "🥉"
  }

  return `#${rank}`
}

export default function Leaderboard({
  player
}) {
  const [players, setPlayers] = useState([])
  const [updatedAt, setUpdatedAt] =
    useState(null)

  const [message, setMessage] =
    useState("")

  const [isLoading, setIsLoading] =
    useState(true)

  const loadLeaderboard = useCallback(
    async ({
      showLoading = false
    } = {}) => {
      if (showLoading) {
        setIsLoading(true)
      }

      try {
        const data = await getLeaderboard()

        setPlayers(data.players)
        setUpdatedAt(data.updatedAt)
        setMessage("")
      } catch (error) {
        setMessage(error.message)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    let cancelled = false

    async function loadInitialLeaderboard() {
      try {
        const data = await getLeaderboard()

        if (!cancelled) {
          setPlayers(data.players)
          setUpdatedAt(data.updatedAt)
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error.message)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadInitialLeaderboard()

    const interval = window.setInterval(() => {
      loadLeaderboard()
    }, 10000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [loadLeaderboard])

  const currentPlayerEntry = player
    ? players.find(
        (entry) => entry.id === player.id
      )
    : null

  return (
    <main className="content">
      <section className="game-page-header">
        <div>
          <span className="eyebrow">
            LIVE RANKINGS
          </span>

          <h2>🏆 Leaderboard</h2>

          <p>
            Players are ranked by their current virtual
            chip balance.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            loadLeaderboard({
              showLoading: true
            })
          }
        >
          Refresh
        </button>
      </section>

      {currentPlayerEntry && (
        <section className="leaderboard-player-summary">
          <div>
            <span className="wallet-label">
              Your position
            </span>

            <strong>
              {getRankDisplay(
                currentPlayerEntry.rank
              )}
            </strong>
          </div>

          <div>
            <span className="wallet-label">
              Player
            </span>

            <strong>
              {currentPlayerEntry.username}
            </strong>
          </div>

          <div>
            <span className="wallet-label">
              Balance
            </span>

            <strong>
              🪙{" "}
              {currentPlayerEntry.balance.toLocaleString()}
            </strong>
          </div>
        </section>
      )}

      {message && (
        <div className="game-message error-message">
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="game-message">
          Loading leaderboard...
        </div>
      ) : (
        <section className="leaderboard-panel">
          <div className="leaderboard-header">
            <span>Rank</span>
            <span>Player</span>
            <span>Balance</span>
          </div>

          {players.length === 0 && (
            <div className="leaderboard-empty">
              No registered players yet.
            </div>
          )}

          {players.map((entry) => {
            const isCurrentPlayer =
              player?.id === entry.id

            return (
              <article
                key={entry.id}
                className={
                  isCurrentPlayer
                    ? "leaderboard-row current-player"
                    : `leaderboard-row rank-${entry.rank}`
                }
              >
                <div className="leaderboard-rank">
                  {getRankDisplay(entry.rank)}
                </div>

                <div className="leaderboard-name">
                  <strong>
                    {entry.username}
                  </strong>

                  {isCurrentPlayer && (
                    <span className="you-badge">
                      You
                    </span>
                  )}
                </div>

                <div className="leaderboard-balance">
                  🪙{" "}
                  {entry.balance.toLocaleString()}
                </div>
              </article>
            )
          })}

          {updatedAt && (
            <div className="leaderboard-updated">
              Automatically refreshes every 10 seconds.
              Last updated:{" "}
              {new Date(
                updatedAt
              ).toLocaleTimeString()}
            </div>
          )}
        </section>
      )}
    </main>
  )
}