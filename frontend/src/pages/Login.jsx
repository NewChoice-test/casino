import { useState } from "react"
import { Navigate } from "react-router-dom"

import {
  loginPlayer,
  registerPlayer,
  saveSessionToken
} from "../services/api"

export default function Login({
  player,
  setPlayer,
  setBalance
}) {
  const [mode, setMode] = useState("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  if (player) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setIsSubmitting(true)
    setMessage("")

    try {
      const request =
        mode === "register"
          ? registerPlayer
          : loginPlayer

      const data = await request({
        username,
        password
      })

      saveSessionToken(data.token)
      setPlayer(data.player)
      setBalance(data.player.balance)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="content">
      <section className="admin-login-panel">
        <span className="eyebrow">
          PLAYER ACCOUNT
        </span>

        <h2>
          {mode === "register"
            ? "Create account"
            : "Player login"}
        </h2>

        <form
          className="admin-login-form"
          onSubmit={handleSubmit}
        >
          <label
            className="admin-label"
            htmlFor="account-username"
          >
            Username
          </label>

          <input
            id="account-username"
            className="bet-input"
            type="text"
            minLength="3"
            maxLength="20"
            required
            autoComplete="username"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
          />

          <label
            className="admin-label"
            htmlFor="account-password"
          >
            Password
          </label>

          <input
            id="account-password"
            className="bet-input"
            type="password"
            minLength="8"
            maxLength="100"
            required
            autoComplete={
              mode === "register"
                ? "new-password"
                : "current-password"
            }
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />

          <button
            type="submit"
            className="spin-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "register"
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        {message && (
          <div className="game-message error-message">
            {message}
          </div>
        )}

        <button
          type="button"
          className="account-mode-button"
          onClick={() => {
            setMode(
              mode === "login"
                ? "register"
                : "login"
            )

            setMessage("")
          }}
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Already registered? Log in"}
        </button>
      </section>
    </main>
  )
}