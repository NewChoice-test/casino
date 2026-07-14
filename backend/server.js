import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import authRoutes from "./routes/auth.js"
import adminRoutes from "./routes/admin.js"
import leaderboardRoutes from "./routes/leaderboard.js"
import settingsRoutes from "./routes/settings.js"

dotenv.config()

const app = express()

const PORT =
  Number(process.env.PORT) || 3000

const configuredFrontendUrls = String(
  process.env.FRONTEND_URL ?? ""
)
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean)

const allowedOrigins = [
  "http://localhost:5173",
  ...configuredFrontendUrls
]

app.use(
  cors({
    origin(origin, callback) {
      /*
       * Requests without an Origin header include direct
       * browser visits, health checks, and server tools.
       */
      if (!origin) {
        callback(null, true)
        return
      }

      const normalizedOrigin =
        origin.replace(/\/$/, "")

      if (
        allowedOrigins.includes(
          normalizedOrigin
        )
      ) {
        callback(null, true)
        return
      }

      console.error(
        `Blocked CORS origin: ${origin}`
      )

      callback(
        new Error(
          `Origin ${origin} is not allowed by CORS`
        )
      )
    },

    methods: [
      "GET",
      "POST",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Admin-Password"
    ]
  })
)

app.use(express.json())

app.get("/", (request, response) => {
  response.json({
    message:
      "Community Casino backend is online",

    allowedFrontends:
      configuredFrontendUrls,

    healthCheck: "/api/health"
  })
})

app.get(
  "/api/health",
  (request, response) => {
    response.json({
      status: "ok",
      application: "Community Casino",
      timestamp: new Date().toISOString()
    })
  }
)

app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use(
  "/api/leaderboard",
  leaderboardRoutes
)
app.use("/api/settings", settingsRoutes)

app.use((request, response) => {
  response.status(404).json({
    error: "Route not found."
  })
})

app.use(
  (error, request, response, next) => {
    console.error(error)

    response.status(500).json({
      error:
        "An unexpected server error occurred."
    })
  }
)

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🎰 Casino backend running on port ${PORT}`
  )

  console.log(
    "Allowed frontend origins:",
    allowedOrigins
  )
})