import {
  useEffect,
  useState
} from "react"

import {
  deleteAdminPlayer,
  getAdminPlayers,
  getAdminSettings,
  updateAdminSettings,
  updatePlayerBalance,
  updatePlayerBan,
  updatePlayerUsername
} from "../services/api"

import {
  getAdminPassword
} from "../utils/adminSession"

export default function Admin() {
  const [players, setPlayers] = useState([])
  const [amounts, setAmounts] = useState({})
  const [usernames, setUsernames] = useState({})

  const [
    deleteConfirmationId,
    setDeleteConfirmationId
  ] = useState(null)

  const [settings, setSettings] = useState({
    games: {
      blackjack: true,
      roulette: true,
      slots: true
    },

    startingBalance: 1000,
    minimumBet: 10,
    maximumBet: 250
  })

  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [
    isSavingSettings,
    setIsSavingSettings
  ] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadAdminData() {
      const password = getAdminPassword()

      if (!password) {
        if (!cancelled) {
          setMessage(
            "Admin password is missing."
          )

          setIsLoading(false)
        }

        return
      }

      try {
        const [
          playersData,
          settingsData
        ] = await Promise.all([
          getAdminPlayers(password),
          getAdminSettings(password)
        ])

        if (!cancelled) {
          setPlayers(playersData.players)
          setSettings(settingsData.settings)

          const initialUsernames = {}

          for (
            const player of playersData.players
          ) {
            initialUsernames[player.id] =
              player.username
          }

          setUsernames(initialUsernames)
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

    loadAdminData()

    return () => {
      cancelled = true
    }
  }, [])

  async function loadPlayers() {
    const password = getAdminPassword()

    try {
      const data = await getAdminPlayers(
        password
      )

      setPlayers(data.players)

      const refreshedUsernames = {}

      for (const player of data.players) {
        refreshedUsernames[player.id] =
          player.username
      }

      setUsernames(refreshedUsernames)
    } catch (error) {
      setMessage(error.message)
    }
  }

  function toggleGame(game) {
    setSettings((current) => ({
      ...current,

      games: {
        ...current.games,
        [game]: !current.games[game]
      }
    }))
  }

  async function saveCasinoSettings() {
    const password = getAdminPassword()

    setIsSavingSettings(true)
    setMessage("")

    try {
      const data = await updateAdminSettings({
        password,
        settings
      })

      setSettings(data.settings)

      setMessage(
        "Casino settings saved successfully."
      )
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSavingSettings(false)
    }
  }

  function getAmount(playerId) {
    return Number(
      amounts[playerId] ?? 0
    )
  }

  async function changeUsername(player) {
    const password = getAdminPassword()

    const username = String(
      usernames[player.id] ?? ""
    ).trim()

    try {
      const data = await updatePlayerUsername({
        password,
        playerId: player.id,
        username
      })

      setPlayers((currentPlayers) =>
        currentPlayers.map((currentPlayer) =>
          currentPlayer.id === player.id
            ? {
                ...currentPlayer,
                username:
                  data.player.username
              }
            : currentPlayer
        )
      )

      setUsernames((current) => ({
        ...current,
        [player.id]: data.player.username
      }))

      setMessage(
        `Username changed to ${data.player.username}.`
      )
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function changeBalance(
    playerId,
    action
  ) {
    const password = getAdminPassword()
    const amount = getAmount(playerId)

    if (
      !Number.isSafeInteger(amount) ||
      amount < 0
    ) {
      setMessage(
        "Enter a valid whole-number amount."
      )

      return
    }

    try {
      await updatePlayerBalance({
        password,
        playerId,
        action,
        amount
      })

      setMessage(
        "Player balance updated."
      )

      await loadPlayers()
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function toggleBan(player) {
    const password = getAdminPassword()

    const confirmed = window.confirm(
      player.isBanned
        ? `Unban ${player.username}?`
        : `Ban ${player.username}?`
    )

    if (!confirmed) {
      return
    }

    try {
      await updatePlayerBan({
        password,
        playerId: player.id,
        isBanned: !player.isBanned
      })

      await loadPlayers()

      setMessage(
        player.isBanned
          ? `${player.username} was unbanned.`
          : `${player.username} was banned.`
      )
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function deletePlayer(player) {
    const password = getAdminPassword()

    try {
      const data = await deleteAdminPlayer({
        password,
        playerId: player.id
      })

      setPlayers((currentPlayers) =>
        currentPlayers.filter(
          (currentPlayer) =>
            currentPlayer.id !== player.id
        )
      )

      setDeleteConfirmationId(null)
      setMessage(data.message)
    } catch (error) {
      setMessage(error.message)
    }
  }

  if (isLoading) {
    return (
      <main className="content">
        <div className="game-message">
          Loading admin dashboard...
        </div>
      </main>
    )
  }

  return (
    <main className="content">
      <section className="game-page-header">
        <div>
          <span className="eyebrow">
            EVENT MANAGEMENT
          </span>

          <h2>⚙️ Admin dashboard</h2>

          <p>
            Control casino settings and manage player
            accounts.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={loadPlayers}
        >
          Refresh players
        </button>
      </section>

      {message && (
        <div className="game-message">
          {message}
        </div>
      )}

      <section className="admin-game-control-panel">
        <div className="admin-game-control-heading">
          <div>
            <span className="eyebrow">
              CASINO SETTINGS
            </span>

            <h3>Game and balance controls</h3>

            <p>
              The starting balance applies only to newly
              registered accounts.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            disabled={isSavingSettings}
            onClick={saveCasinoSettings}
          >
            {isSavingSettings
              ? "Saving..."
              : "Save casino settings"}
          </button>
        </div>

        <div className="admin-game-toggles">
          {[
            {
              key: "blackjack",
              name: "Blackjack",
              icon: "🃏"
            },
            {
              key: "roulette",
              name: "Roulette",
              icon: "🎡"
            },
            {
              key: "slots",
              name: "Slots",
              icon: "🎰"
            }
          ].map((game) => (
            <button
              type="button"
              key={game.key}
              className={
                settings.games[game.key]
                  ? "admin-game-toggle enabled"
                  : "admin-game-toggle disabled"
              }
              onClick={() =>
                toggleGame(game.key)
              }
            >
              <span className="admin-game-toggle-icon">
                {game.icon}
              </span>

              <span>
                <strong>{game.name}</strong>

                <small>
                  {settings.games[game.key]
                    ? "Open for players"
                    : "Temporarily closed"}
                </small>
              </span>

              <span className="admin-game-toggle-status">
                {settings.games[game.key]
                  ? "ONLINE"
                  : "OFFLINE"}
              </span>
            </button>
          ))}
        </div>

        <div className="admin-bet-settings">
          <label>
            <span>Starting balance</span>

            <input
              className="bet-input"
              type="number"
              min="0"
              value={settings.startingBalance}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,

                  startingBalance: Number(
                    event.target.value
                  )
                }))
              }
            />
          </label>

          <label>
            <span>Minimum bet</span>

            <input
              className="bet-input"
              type="number"
              min="1"
              value={settings.minimumBet}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,

                  minimumBet: Number(
                    event.target.value
                  )
                }))
              }
            />
          </label>

          <label>
            <span>Maximum bet</span>

            <input
              className="bet-input"
              type="number"
              min="1"
              value={settings.maximumBet}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,

                  maximumBet: Number(
                    event.target.value
                  )
                }))
              }
            />
          </label>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <span className="eyebrow">
            PLAYER MANAGEMENT
          </span>

          <h2>Registered players</h2>
        </div>
      </section>

      <section className="admin-player-list">
        {players.map((player) => (
          <article
            className={
              player.isBanned
                ? "admin-player-card banned"
                : "admin-player-card"
            }
            key={player.id}
          >
            <div className="admin-player-info">
              <div>
                <span className="wallet-label">
                  Player
                </span>

                <h3>{player.username}</h3>
              </div>

              <div>
                <span className="wallet-label">
                  Balance
                </span>

                <strong>
                  🪙{" "}
                  {player.balance.toLocaleString()}
                </strong>
              </div>

              <div>
                <span className="wallet-label">
                  Status
                </span>

                <strong>
                  {player.isBanned
                    ? "Banned"
                    : "Active"}
                </strong>
              </div>
            </div>

            <div className="admin-username-controls">
              <input
                className="bet-input"
                type="text"
                minLength="3"
                maxLength="20"
                value={
                  usernames[player.id] ?? ""
                }
                onChange={(event) =>
                  setUsernames((current) => ({
                    ...current,

                    [player.id]:
                      event.target.value
                  }))
                }
              />

              <button
                type="button"
                onClick={() =>
                  changeUsername(player)
                }
              >
                Change username
              </button>
            </div>

            <div className="admin-player-controls">
              <input
                className="bet-input"
                type="number"
                min="0"
                placeholder="Amount"
                value={
                  amounts[player.id] ?? ""
                }
                onChange={(event) =>
                  setAmounts((current) => ({
                    ...current,

                    [player.id]:
                      event.target.value
                  }))
                }
              />

              <button
                type="button"
                onClick={() =>
                  changeBalance(
                    player.id,
                    "add"
                  )
                }
              >
                Add chips
              </button>

              <button
                type="button"
                onClick={() =>
                  changeBalance(
                    player.id,
                    "remove"
                  )
                }
              >
                Remove chips
              </button>

              <button
                type="button"
                onClick={() =>
                  changeBalance(
                    player.id,
                    "set"
                  )
                }
              >
                Set balance
              </button>

              <button
                type="button"
                className="admin-danger-button"
                onClick={() =>
                  toggleBan(player)
                }
              >
                {player.isBanned
                  ? "Unban player"
                  : "Ban player"}
              </button>

              {deleteConfirmationId === player.id ? (
                <>
                  <button
                    type="button"
                    className="admin-delete-button"
                    onClick={() =>
                      deletePlayer(player)
                    }
                  >
                    Confirm permanent delete
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteConfirmationId(null)
                    }
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="admin-delete-button"
                  onClick={() =>
                    setDeleteConfirmationId(
                      player.id
                    )
                  }
                >
                  Delete user
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}