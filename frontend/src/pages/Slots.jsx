import { useState } from "react"

const symbols = [
  { icon: "🍒", multiplier: 3 },
  { icon: "🍋", multiplier: 4 },
  { icon: "⭐", multiplier: 6 },
  { icon: "💎", multiplier: 10 },
  { icon: "7️⃣", multiplier: 15 }
]

function getRandomSymbol() {
  const randomIndex = Math.floor(
    Math.random() * symbols.length
  )

  return symbols[randomIndex]
}

export default function Slots({
  balance,
  setBalance,
  settings
}) {
  const [betAmount, setBetAmount] = useState(50)

  const [reels, setReels] = useState([
    symbols[0],
    symbols[1],
    symbols[2]
  ])

  const [message, setMessage] = useState(
    "Choose a bet and spin the reels."
  )

  const [isSpinning, setIsSpinning] = useState(false)

  function handleSpin() {
    const bet = Number(betAmount)

    if (bet < settings.minimumBet) {
  setMessage(
    `The minimum bet is ${settings.minimumBet} chips.`
  )
  return
}

if (bet > settings.maximumBet) {
  setMessage(
    `The maximum bet is ${settings.maximumBet} chips.`
  )
  return
}
    if (!Number.isFinite(bet) || bet <= 0) {
      setMessage("Enter a valid bet amount.")
      return
    }

    if (bet > balance) {
      setMessage("You do not have enough chips.")
      return
    }

    if (isSpinning) {
      return
    }

    setIsSpinning(true)
    setMessage("The reels are spinning...")

    setBalance((currentBalance) =>
      currentBalance - bet
    )

    const animationInterval = setInterval(() => {
      setReels([
        getRandomSymbol(),
        getRandomSymbol(),
        getRandomSymbol()
      ])
    }, 100)

    setTimeout(() => {
      clearInterval(animationInterval)

      const finalReels = [
        getRandomSymbol(),
        getRandomSymbol(),
        getRandomSymbol()
      ]

      setReels(finalReels)

      const allMatch =
  finalReels[0].icon === finalReels[1].icon &&
  finalReels[1].icon === finalReels[2].icon

const anyTwoMatch =
  finalReels[0].icon === finalReels[1].icon ||
  finalReels[0].icon === finalReels[2].icon ||
  finalReels[1].icon === finalReels[2].icon

      if (allMatch) {
        const payout =
          bet * finalReels[0].multiplier

        setBalance((currentBalance) =>
          currentBalance + payout
        )

        setMessage(
          `Jackpot! You won ${payout.toLocaleString()} chips.`
        )
      } else if (anyTwoMatch) {
        const payout = bet * 2

        setBalance((currentBalance) =>
          currentBalance + payout
        )

        setMessage(
          `Two matching symbols! You won ${payout.toLocaleString()} chips.`
        )
      } else {
        setMessage(
          `No match. You lost ${bet.toLocaleString()} chips.`
        )
      }

      setIsSpinning(false)
    }, 1800)
  }

  return (
    <main className="content">
      <section className="game-page-header">
        <div>
          <span className="eyebrow">
            CASINO GAME
          </span>

          <h2>🎰 Slots</h2>

          <p>
            Match symbols across all three reels to win
            virtual chips.
          </p>
        </div>

        <div className="mini-balance">
          Balance: 🪙 {balance.toLocaleString()}
        </div>
      </section>

      <section className="slots-layout">
        <div className="slot-machine">
          <div className="slot-machine-top">
            COMMUNITY JACKPOT
          </div>

          <div className="slot-reels">
            {reels.map((symbol, index) => (
              <div
                key={index}
                className={
                  isSpinning
                    ? "slot-reel spinning"
                    : "slot-reel"
                }
              >
                {symbol.icon}
              </div>
            ))}
          </div>

          <div className="slot-payline">
            PAYLINE
          </div>

          <div className="slot-message">
            {message}
          </div>
        </div>

        <div className="betting-panel">
          <span className="eyebrow">
            PLACE YOUR BET
          </span>

          <h3>Spin settings</h3>

          <label
            className="bet-label"
            htmlFor="slots-bet"
          >
            Bet amount
          </label>

          <input
            id="slots-bet"
            className="bet-input"
            type="number"
            min="1"
            step="10"
            value={betAmount}
            disabled={isSpinning}
            onChange={(event) =>
              setBetAmount(event.target.value)
            }
          />

          <div className="quick-bets">
            {[10, 50, 100, 250].map((amount) => (
              <button
                type="button"
                key={amount}
                disabled={isSpinning}
                onClick={() => setBetAmount(amount)}
              >
                {amount}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="spin-button"
            onClick={handleSpin}
            disabled={isSpinning || balance <= 0}
          >
            {isSpinning
              ? "Spinning..."
              : "Spin the reels"}
          </button>

          <div className="payout-table">
            <h4>Payouts</h4>

            {symbols.map((symbol) => (
              <div
                key={symbol.icon}
                className="payout-row"
              >
                <span>
                  {symbol.icon} {symbol.icon} {symbol.icon}
                </span>

                <strong>
                  {symbol.multiplier}×
                </strong>
              </div>
            ))}

            <div className="payout-row">
              <span>Any two matching</span>
              <strong>2×</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}