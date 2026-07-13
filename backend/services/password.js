import {
  randomBytes,
  scrypt,
  timingSafeEqual
} from "node:crypto"

import { promisify } from "node:util"

const scryptAsync = promisify(scrypt)

const KEY_LENGTH = 64

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex")

  const derivedKey = await scryptAsync(
    password,
    salt,
    KEY_LENGTH
  )

  return {
    salt,
    hash: Buffer.from(derivedKey).toString("hex")
  }
}

export async function verifyPassword({
  password,
  salt,
  expectedHash
}) {
  const derivedKey = await scryptAsync(
    password,
    salt,
    KEY_LENGTH
  )

  const actualBuffer = Buffer.from(derivedKey)

  const expectedBuffer = Buffer.from(
    expectedHash,
    "hex"
  )

  if (
    actualBuffer.length !== expectedBuffer.length
  ) {
    return false
  }

  return timingSafeEqual(
    actualBuffer,
    expectedBuffer
  )
}