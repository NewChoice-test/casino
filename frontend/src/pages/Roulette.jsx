import { useState } from "react"

import RouletteWheel from "../components/RouletteWheel"

import {
  wheelNumbers,
  getNumberColor
} from "../utils/roulette"

export default function Roulette({
  balance,
  setBalance,
  settings
}) {
  const [betAmount, setBetAmount] = useState(50)
  const [selectedColor, setSelectedColor] = useState("red")
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState(
    "Choose a colour and place your bet."
  )
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)

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
    setMessage("The wheel is spinning...")

    const winningIndex = Math.floor(
      Math.random() * wheelNumbers.length
    )

    const winningNumber = wheelNumbers[winningIndex]
    const winningColor = getNumberColor(winningNumber)

    const segmentAngle = 360 / wheelNumbers.length

    const targetAngle =
      360 - winningIndex * segmentAngle

    const extraSpins = 360 * 6

    const nextRotation =
      rotation + extraSpins + targetAngle

    setRotation(nextRotation)

    setTimeout(() => {
      setResult({
        number: winningNumber,
        color: winningColor
      })

      if (selectedColor === winningColor) {
        const multiplier =
          winningColor === "green" ? 14 : 2

        const winnings = bet * multiplier
        const profit = winnings - bet

        setBalance((currentBalance) =>
          currentBalance + profit
        )

        setMessage(
          `You won ${profit.toLocaleString()} chips!`
        )
      } else {
        setBalance((currentBalance) =>
          currentBalance - bet
        )

        setMessage(
          `You lost ${bet.toLocaleString()} chips.`
        )
      }

      setIsSpinning(false)
    }, 4000)
  }

  return (
    <main className="content">
      <section className="game-page-header">
        <div>
          <span className="eyebrow">
            TABLE GAME
          </span>

          <h2>🎡 Roulette</h2>

          <p>
            Choose a colour, place your virtual bet,
            and spin the wheel.
          </p>
        </div>

        <div className="mini-balance">
          Balance: 🪙 {balance.toLocaleString()}
        </div>
      </section>

      <section className="roulette-layout">
        <div className="roulette-panel">
          <RouletteWheel
            rotation={rotation}
            isSpinning={isSpinning}
            result={result}
          />

          <div className="roulette-result">
            {result && (
              <>
                <span
                  className={`result-dot ${result.color}`}
                />

                <strong>
                  Number {result.number}
                </strong>

                <span>
                  {result.color.toUpperCase()}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="betting-panel">
          <span className="eyebrow">
            PLACE YOUR BET
          </span>

          <h3>Choose a colour</h3>

          <div className="roulette-options">
            <button
              type="button"
              className={
                selectedColor === "red"
                  ? "roulette-option red selected"
                  : "roulette-option red"
              }
              onClick={() => setSelectedColor("red")}
              disabled={isSpinning}
            >
              Red
              <small>Pays 2×</small>
            </button>

            <button
              type="button"
              className={
                selectedColor === "black"
                  ? "roulette-option black selected"
                  : "roulette-option black"
              }
              onClick={() => setSelectedColor("black")}
              disabled={isSpinning}
            >
              Black
              <small>Pays 2×</small>
            </button>

            <button
              type="button"
              className={
                selectedColor === "green"
                  ? "roulette-option green selected"
                  : "roulette-option green"
              }
              onClick={() => setSelectedColor("green")}
              disabled={isSpinning}
            >
              Green
              <small>Pays 14×</small>
            </button>
          </div>

          <label
            className="bet-label"
            htmlFor="roulette-bet"
          >
            Bet amount
          </label>

          <input
            id="roulette-bet"
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
              : "Spin the wheel"}
          </button>

          <div className="game-message">
            {message}
          </div>
        </div>
      </section>
    </main>
  )
}