import {
  timingSafeEqual
} from "node:crypto"

function passwordsMatch(
  providedPassword,
  expectedPassword
) {
  const providedBuffer = Buffer.from(
    providedPassword
  )

  const expectedBuffer = Buffer.from(
    expectedPassword
  )

  if (
    providedBuffer.length !==
    expectedBuffer.length
  ) {
    return false
  }

  return timingSafeEqual(
    providedBuffer,
    expectedBuffer
  )
}

export function requireAdmin(
  request,
  response,
  next
) {
  const providedPassword = String(
    request.headers["x-admin-password"] ?? ""
  )

  const expectedPassword = String(
    process.env.ADMIN_PASSWORD ?? ""
  )

  if (!expectedPassword) {
    return response.status(500).json({
      error:
        "The server admin password has not been configured."
    })
  }

  if (
    !providedPassword ||
    !passwordsMatch(
      providedPassword,
      expectedPassword
    )
  ) {
    return response.status(401).json({
      error: "Incorrect admin password."
    })
  }

  next()
}