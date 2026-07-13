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

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:5173"

app.use(
  cors({
    origin: FRONTEND_URL
  })
)

app.use(express.json())

app.get("/api/health", (request, response) => {
  response.json({
    status: "ok",
    application: "Community Casino",
    timestamp: new Date().toISOString()
  })
})

app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/leaderboard", leaderboardRoutes)
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

app.listen(PORT, () => {
  console.log(
    `🎰 Casino backend running at http://localhost:${PORT}`
  )
})