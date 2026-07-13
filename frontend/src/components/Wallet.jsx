export default function Wallet({
  player,
  balance
}) {
  const isAdmin = player?.isAdmin === true

  return (
    <div className="wallet">
      <div className="wallet-player">
        <span className="wallet-label">
          Player
        </span>

        <strong>
          {isAdmin
            ? "👑 Admin"
            : player
              ? player.username
              : "Not logged in"}
        </strong>
      </div>

      <div className="wallet-balance">
        <span className="wallet-label">
          {isAdmin
            ? "Access level"
            : "Balance"}
        </span>

        <strong>
          {isAdmin
            ? "Administrator"
            : player
              ? `🪙 ${balance.toLocaleString()} chips`
              : "Log in to view"}
        </strong>
      </div>
    </div>
  )
}