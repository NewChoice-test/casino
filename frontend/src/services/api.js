const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000"

const TOKEN_KEY =
  "communityCasinoSessionToken"

export function getSessionToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveSessionToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearSessionToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function apiRequest(
  path,
  options = {}
) {
  const token = getSessionToken()

  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers
    }
  )

  const data = await response.json().catch(
    () => ({})
  )

  if (!response.ok) {
    throw new Error(
      data.error ||
      `Request failed with status ${response.status}`
    )
  }

  return data
}

export function registerPlayer({
  username,
  password
}) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username,
      password
    })
  })
}

export function loginPlayer({
  username,
  password
}) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password
    })
  })
}

export function getCurrentPlayer() {
  return apiRequest("/api/auth/me")
}

export function logoutPlayer() {
  return apiRequest("/api/auth/logout", {
    method: "POST"
  })
}

export async function getBackendHealth() {
  return apiRequest("/api/health")
}
export function verifyAdminPassword(
  password
) {
  return apiRequest("/api/admin/verify", {
    headers: {
      "X-Admin-Password": password
    }
  })
}

export function getAdminPlayers(
  password
) {
  return apiRequest("/api/admin/players", {
    headers: {
      "X-Admin-Password": password
    }
  })
}

export function updatePlayerBalance({
  password,
  playerId,
  action,
  amount
}) {
  return apiRequest(
    `/api/admin/players/${playerId}/balance`,
    {
      method: "PATCH",

      headers: {
        "X-Admin-Password": password
      },

      body: JSON.stringify({
        action,
        amount
      })
    }
  )
}

export function updatePlayerBan({
  password,
  playerId,
  isBanned
}) {
  return apiRequest(
    `/api/admin/players/${playerId}/ban`,
    {
      method: "PATCH",

      headers: {
        "X-Admin-Password": password
      },

      body: JSON.stringify({
        isBanned
      })
    }
  )
}
export function getLeaderboard() {
  return apiRequest("/api/leaderboard")
}
export function getCasinoSettings() {
  return apiRequest("/api/settings")
}

export function getAdminSettings(password) {
  return apiRequest("/api/admin/settings", {
    headers: {
      "X-Admin-Password": password
    }
  })
}

export function updateAdminSettings({
  password,
  settings
}) {
  return apiRequest("/api/admin/settings", {
    method: "PATCH",

    headers: {
      "X-Admin-Password": password
    },

    body: JSON.stringify(settings)
  })
}
export function deleteAdminPlayer({
  password,
  playerId
}) {
  return apiRequest(
    `/api/admin/players/${playerId}`,
    {
      method: "DELETE",

      headers: {
        "X-Admin-Password": password
      }
    }
  )
}