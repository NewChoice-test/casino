import {
  findSession
} from "../services/session.js"

export function requireAuthentication(
  request,
  response,
  next
) {
  const authorization =
    request.headers.authorization

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return response.status(401).json({
      error: "Authentication required."
    })
  }

  const token = authorization.slice(7).trim()

  if (!token) {
    return response.status(401).json({
      error: "Authentication required."
    })
  }

  const session = findSession(token)

  if (!session) {
    return response.status(401).json({
      error: "Your session is invalid or expired."
    })
  }

  request.player = {
    id: session.player_id,
    username: session.username,
    balance: session.balance,
    createdAt: session.created_at
  }

  request.sessionToken = token

  next()
}