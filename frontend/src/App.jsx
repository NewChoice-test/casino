import { useEffect, useState } from "react"

import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate
} from "react-router-dom"

import Wallet from "./components/Wallet"
import ServerStatus from "./components/ServerStatus"
import AdminGuard from "./components/AdminGuard"
import GameUnavailable from "./components/GameUnavailable"

import Home from "./pages/Home"
import Blackjack from "./pages/Blackjack"
import Roulette from "./pages/Roulette"
import Slots from "./pages/Slots"
import Admin from "./pages/Admin"
import Login from "./pages/Login"
import Leaderboard from "./pages/Leaderboard"

import {
  clearSessionToken,
  getCasinoSettings,
  getCurrentPlayer,
  getSessionToken,
  logoutPlayer
} from "./services/api"

import {
  clearAdminPassword,
  getAdminPassword
} from "./utils/adminSession"

const DEFAULT_SETTINGS = {
  minimumBet: 10,
  maximumBet: 250,

  games: {
    blackjack: true,
    roulette: true,
    slots: true
  }
}

const ADMIN_PREVIEW_BALANCE = 1000000

function createAdminPlayer() {
  return {
    id: "administrator",
    username: "Admin",
    balance: ADMIN_PREVIEW_BALANCE,
    isAdmin: true
  }
}

function App() {
  const hasSavedAdminSession =
    Boolean(getAdminPassword())

  const [settings, setSettings] = useState(
    DEFAULT_SETTINGS
  )

  const [player, setPlayer] = useState(
    () =>
      hasSavedAdminSession
        ? createAdminPlayer()
        : null
  )

  const [balance, setBalance] = useState(
    hasSavedAdminSession
      ? ADMIN_PREVIEW_BALANCE
      : 0
  )

  const [
    isLoadingPlayer,
    setIsLoadingPlayer
  ] = useState(!hasSavedAdminSession)

  useEffect(() => {
    async function restoreSession() {
      if (getAdminPassword()) {
        setIsLoadingPlayer(false)
        return
      }

      if (!getSessionToken()) {
        setIsLoadingPlayer(false)
        return
      }

      try {
        const data = await getCurrentPlayer()

        setPlayer(data.player)
        setBalance(data.player.balance)
      } catch (error) {
        console.error(
          "Could not restore player session:",
          error
        )

        clearSessionToken()
        setPlayer(null)
        setBalance(0)
      } finally {
        setIsLoadingPlayer(false)
      }
    }

    restoreSession()
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadSettings() {
      try {
        const data =
          await getCasinoSettings()

        if (!cancelled) {
          setSettings(data.settings)
        }
      } catch (error) {
        console.error(
          "Could not load casino settings:",
          error
        )
      }
    }

    loadSettings()

    const interval = window.setInterval(
      loadSettings,
      10000
    )

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  function handleAdminLogin() {
    clearSessionToken()

    setPlayer(createAdminPlayer())
    setBalance(ADMIN_PREVIEW_BALANCE)
  }

  function handleAdminLogout() {
    clearAdminPassword()

    setPlayer(null)
    setBalance(0)
  }

  async function handleSiteLogout() {
    if (player?.isAdmin) {
      handleAdminLogout()
      return
    }

    try {
      await logoutPlayer()
    } catch (error) {
      console.error(
        "Server logout failed:",
        error
      )
    }

    clearSessionToken()
    setPlayer(null)
    setBalance(0)
  }

  if (isLoadingPlayer) {
    return (
      <main className="content">
        <div className="game-message">
          Loading player account...
        </div>
      </main>
    )
  }

  return (
    <BrowserRouter>
      <div className="casino">
        <header className="header">
          <div>
            <h1>
              ♠ Community Casino ♠
            </h1>

            <p>
              Virtual event casino — no real money
            </p>
          </div>

          <Wallet
            player={player}
            balance={balance}
          />
        </header>

        <nav className="navbar">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            🏠 Home
          </NavLink>

          <NavLink
            to={player ? "/blackjack" : "/login"}
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            🃏 Blackjack
          </NavLink>

          <NavLink
            to={player ? "/roulette" : "/login"}
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            🎡 Roulette
          </NavLink>

          <NavLink
            to={player ? "/slots" : "/login"}
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            🎰 Slots
          </NavLink>

          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            🏆 Leaderboard
          </NavLink>

          <NavLink
            to="/admin"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            ⚙️ Admin
          </NavLink>

          {player ? (
            <button
              type="button"
              className="nav-link"
              onClick={handleSiteLogout}
            >
              👤 Log out
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              👤 Login
            </NavLink>
          )}
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <Home
                player={player}
                settings={settings}
              />
            }
          />

          <Route
            path="/login"
            element={
              player ? (
                <Navigate to="/" replace />
              ) : (
                <Login
                  player={player}
                  setPlayer={(newPlayer) => {
                    setPlayer(newPlayer)
                    setBalance(
                      newPlayer.balance
                    )
                  }}
                  setBalance={setBalance}
                />
              )
            }
          />

          <Route
            path="/blackjack"
            element={
              !player ? (
                <Navigate
                  to="/login"
                  replace
                />
              ) : settings.games.blackjack ? (
                <Blackjack
                  balance={balance}
                  setBalance={setBalance}
                  settings={settings}
                />
              ) : (
                <GameUnavailable
                  game="blackjack"
                />
              )
            }
          />

          <Route
            path="/roulette"
            element={
              !player ? (
                <Navigate
                  to="/login"
                  replace
                />
              ) : settings.games.roulette ? (
                <Roulette
                  balance={balance}
                  setBalance={setBalance}
                  settings={settings}
                />
              ) : (
                <GameUnavailable
                  game="roulette"
                />
              )
            }
          />

          <Route
            path="/slots"
            element={
              !player ? (
                <Navigate
                  to="/login"
                  replace
                />
              ) : settings.games.slots ? (
                <Slots
                  balance={balance}
                  setBalance={setBalance}
                  settings={settings}
                />
              ) : (
                <GameUnavailable
                  game="slots"
                />
              )
            }
          />

          <Route
            path="/leaderboard"
            element={
              <Leaderboard
                player={
                  player?.isAdmin
                    ? null
                    : player
                }
              />
            }
          />

          <Route
            path="/admin"
            element={
              <AdminGuard
                onAdminLogin={
                  handleAdminLogin
                }
                onAdminLogout={
                  handleAdminLogout
                }
              >
                <Admin />
              </AdminGuard>
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>

        <footer className="footer">
          <span>
            Community Casino uses virtual chips only.
          </span>

          <ServerStatus />
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App