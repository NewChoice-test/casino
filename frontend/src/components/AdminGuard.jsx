import { useState } from "react"

import {
  verifyAdminPassword
} from "../services/api"

import {
  clearAdminPassword,
  getAdminPassword,
  saveAdminPassword
} from "../utils/adminSession"

export default function AdminGuard({
  children,
  onAdminLogin,
  onAdminLogout
}) {
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  const [isChecking, setIsChecking] =
    useState(false)

  const [
    isAuthenticated,
    setIsAuthenticated
  ] = useState(
    () => Boolean(getAdminPassword())
  )

  async function handleLogin(event) {
    event.preventDefault()

    setIsChecking(true)
    setMessage("")

    try {
      await verifyAdminPassword(password)

      saveAdminPassword(password)

      setIsAuthenticated(true)
      setPassword("")

      onAdminLogin()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsChecking(false)
    }
  }

  function handleLogout() {
    clearAdminPassword()

    setIsAuthenticated(false)
    setPassword("")
    setMessage("")

    onAdminLogout()
  }

  if (!isAuthenticated) {
    return (
      <main className="content">
        <section className="admin-login-panel">
          <span className="eyebrow">
            RESTRICTED AREA
          </span>

          <h2>🔐 Admin login</h2>

          <p>
            Logging in here also logs you into the
            casino as Admin.
          </p>

          <form
            className="admin-login-form"
            onSubmit={handleLogin}
          >
            <label
              className="admin-label"
              htmlFor="admin-password"
            >
              Password
            </label>

            <input
              id="admin-password"
              className="bet-input"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />

            <button
              type="submit"
              className="spin-button"
              disabled={isChecking}
            >
              {isChecking
                ? "Checking..."
                : "Log in as Admin"}
            </button>
          </form>

          {message && (
            <div className="game-message error-message">
              {message}
            </div>
          )}
        </section>
      </main>
    )
  }

  return (
    <>
      <div className="admin-session-bar">
        <span>
          Administrator session active
        </span>

        <button
          type="button"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>

      {children}
    </>
  )
}