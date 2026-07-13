const ADMIN_SESSION_KEY =
  "communityCasinoAdminPassword"

export function getAdminPassword() {
  return sessionStorage.getItem(
    ADMIN_SESSION_KEY
  )
}

export function saveAdminPassword(password) {
  sessionStorage.setItem(
    ADMIN_SESSION_KEY,
    password
  )
}

export function clearAdminPassword() {
  sessionStorage.removeItem(
    ADMIN_SESSION_KEY
  )
}