import { isRedSuit } from "../utils/blackjack"

export default function PlayingCard({
  card,
  hidden = false
}) {
  if (hidden) {
    return (
      <div className="playing-card card-back">
        <div className="card-back-pattern">
          ♠
        </div>
      </div>
    )
  }

  const redSuit = isRedSuit(card.suit)

  return (
    <div
      className={
        redSuit
          ? "playing-card red-card"
          : "playing-card"
      }
    >
      <div className="card-corner top-left">
        <strong>{card.rank}</strong>
        <span>{card.suit}</span>
      </div>

      <div className="card-suit">
        {card.suit}
      </div>

      <div className="card-corner bottom-right">
        <strong>{card.rank}</strong>
        <span>{card.suit}</span>
      </div>
    </div>
  )
}