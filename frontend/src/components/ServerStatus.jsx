import { useEffect, useState } from "react"

import {
  getBackendHealth
} from "../services/api"

export default function ServerStatus() {
  const [status, setStatus] =
    useState("checking")

  useEffect(() => {
    let isMounted = true

    async function checkServer() {
      try {
        await getBackendHealth()

        if (isMounted) {
          setStatus("online")
        }
      } catch (error) {
        console.error(
          "Backend connection failed:",
          error
        )

        if (isMounted) {
          setStatus("offline")
        }
      }
    }

    checkServer()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div
      className={`server-status ${status}`}
      title="Backend server status"
    >
      <span className="server-status-dot" />

      {status === "checking" &&
        "Checking server..."}

      {status === "online" &&
        "Server online"}

      {status === "offline" &&
        "Server offline"}
    </div>
  )
}