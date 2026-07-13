import { useState } from "react"

import PlayingCard from "../components/PlayingCard"

import {
  createDeck,
  calculateHandValue,
  isBlackjack
} from "../utils/blackjack"

export default function Blackjack({
  balance,
  setBalance,
  settings
}) {
  const [betAmount, setBetAmount] = useState(50)

  const [deck, setDeck] = useState([])

  const [playerHand, setPlayerHand] = useState([])

  const [dealerHand, setDealerHand] = useState([])

  const [gameStatus, setGameStatus] = useState("ready")

  const [message, setMessage] = useState(
    "Place your bet and deal the cards."
  )

  const playerScore =
    calculateHandValue(playerHand)

  const dealerScore =
    calculateHandValue(dealerHand)

  const gameInProgress =
    gameStatus === "playing"

  function finishRound({
    result,
    bet,
    messageText
  }) {
    if (result === "win") {
      setBalance((currentBalance) =>
        currentBalance + bet * 2
      )
    }

    if (result === "blackjack") {
      setBalance((currentBalance) =>
        currentBalance + bet * 2.5
      )
    }

    if (result === "push") {
      setBalance((currentBalance) =>
        currentBalance + bet
      )
    }

    setMessage(messageText)
    setGameStatus("finished")
  }

  function determineWinner(
    finalPlayerHand,
    finalDealerHand,
    bet
  ) {
    const finalPlayerScore =
      calculateHandValue(finalPlayerHand)

    const finalDealerScore =
      calculateHandValue(finalDealerHand)

    if (finalPlayerScore > 21) {
      finishRound({
        result: "lose",
        bet,
        messageText:
          `You busted with ${finalPlayerScore}.`
      })

      return
    }

    if (finalDealerScore > 21) {
      finishRound({
        result: "win",
        bet,
        messageText:
          `Dealer busted with ${finalDealerScore}. You win!`
      })

      return
    }

    if (finalPlayerScore > finalDealerScore) {
      finishRound({
        result: "win",
        bet,
        messageText:
          `You win ${finalPlayerScore} to ${finalDealerScore}!`
      })

      return
    }

    if (finalPlayerScore < finalDealerScore) {
      finishRound({
        result: "lose",
        bet,
        messageText:
          `Dealer wins ${finalDealerScore} to ${finalPlayerScore}.`
      })

      return
    }

    finishRound({
      result: "push",
      bet,
      messageText:
        `Push. Both hands have ${finalPlayerScore}.`
    })
  }

  function handleDeal() {
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

    const newDeck = createDeck()

    const newPlayerHand = [
      newDeck.pop(),
      newDeck.pop()
    ]

    const newDealerHand = [
      newDeck.pop(),
      newDeck.pop()
    ]

    setBalance((currentBalance) =>
      currentBalance - bet
    )

    setDeck(newDeck)
    setPlayerHand(newPlayerHand)
    setDealerHand(newDealerHand)
    setGameStatus("playing")
    setMessage("Choose hit or stand.")

    const playerHasBlackjack =
      isBlackjack(newPlayerHand)

    const dealerHasBlackjack =
      isBlackjack(newDealerHand)

    if (
      playerHasBlackjack &&
      dealerHasBlackjack
    ) {
      setTimeout(() => {
        finishRound({
          result: "push",
          bet,
          messageText:
            "Both player and dealer have blackjack. Push."
        })
      }, 500)

      return
    }

    if (playerHasBlackjack) {
      setTimeout(() => {
        finishRound({
          result: "blackjack",
          bet,
          messageText:
            "Blackjack! You win with a 3:2 payout."
        })
      }, 500)

      return
    }

    if (dealerHasBlackjack) {
      setTimeout(() => {
        finishRound({
          result: "lose",
          bet,
          messageText:
            "Dealer has blackjack."
        })
      }, 500)
    }
  }

  function handleHit() {
    if (!gameInProgress || deck.length === 0) {
      return
    }

    const updatedDeck = [...deck]
    const nextCard = updatedDeck.pop()

    const updatedPlayerHand = [
      ...playerHand,
      nextCard
    ]

    setDeck(updatedDeck)
    setPlayerHand(updatedPlayerHand)

    const updatedScore =
      calculateHandValue(updatedPlayerHand)

    if (updatedScore > 21) {
      finishRound({
        result: "lose",
        bet: Number(betAmount),
        messageText:
          `You busted with ${updatedScore}.`
      })

      return
    }

    if (updatedScore === 21) {
      setTimeout(() => {
        handleStandWithHands(
          updatedPlayerHand,
          dealerHand,
          updatedDeck
        )
      }, 350)
    }
  }

  function handleStandWithHands(
    currentPlayerHand,
    currentDealerHand,
    currentDeck
  ) {
    if (!gameInProgress) {
      return
    }

    const updatedDeck = [...currentDeck]
    const updatedDealerHand = [
      ...currentDealerHand
    ]

    while (
      calculateHandValue(updatedDealerHand) < 17
    ) {
      const nextCard = updatedDeck.pop()
      updatedDealerHand.push(nextCard)
    }

    setDeck(updatedDeck)
    setDealerHand(updatedDealerHand)

    determineWinner(
      currentPlayerHand,
      updatedDealerHand,
      Number(betAmount)
    )
  }

  function handleStand() {
    handleStandWithHands(
      playerHand,
      dealerHand,
      deck
    )
  }

  function handleNewRound() {
    setPlayerHand([])
    setDealerHand([])
    setDeck([])
    setGameStatus("ready")
    setMessage("Place your bet and deal the cards.")
  }

  const hideDealerCard =
    gameStatus === "playing"

  const visibleDealerScore =
    hideDealerCard
      ? dealerHand.length > 0
        ? calculateHandValue([dealerHand[0]])
        : 0
      : dealerScore

  return (
    <main className="content">
      <section className="game-page-header">
        <div>
          <span className="eyebrow">
            TABLE GAME
          </span>

          <h2>🃏 Blackjack</h2>

          <p>
            Get closer to 21 than the dealer without
            going over.
          </p>
        </div>

        <div className="mini-balance">
          Balance: 🪙 {balance.toLocaleString()}
        </div>
      </section>

      <section className="blackjack-layout">
        <div className="blackjack-table">
          <div className="blackjack-table-title">
            BLACKJACK PAYS 3 TO 2
          </div>

          <section className="blackjack-hand">
            <div className="hand-heading">
              <div>
                <span className="eyebrow">
                  DEALER
                </span>

                <h3>
                  Dealer hand
                </h3>
              </div>

              <div className="hand-score">
                Score: {visibleDealerScore}
                {hideDealerCard && " + ?"}
              </div>
            </div>

            <div className="cards-row">
              {dealerHand.length === 0 && (
                <div className="empty-hand">
                  Dealer cards appear here
                </div>
              )}

              {dealerHand.map((card, index) => (
                <PlayingCard
                  key={card.id}
                  card={card}
                  hidden={
                    index === 1 &&
                    hideDealerCard
                  }
                />
              ))}
            </div>
          </section>

          <div className="blackjack-divider">
            <span>21</span>
          </div>

          <section className="blackjack-hand">
            <div className="hand-heading">
              <div>
                <span className="eyebrow">
                  PLAYER
                </span>

                <h3>
                  Your hand
                </h3>
              </div>

              <div className="hand-score">
                Score: {playerScore}
              </div>
            </div>

            <div className="cards-row">
              {playerHand.length === 0 && (
                <div className="empty-hand">
                  Your cards appear here
                </div>
              )}

              {playerHand.map((card) => (
                <PlayingCard
                  key={card.id}
                  card={card}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="betting-panel">
          <span className="eyebrow">
            TABLE CONTROLS
          </span>

          <h3>Place your bet</h3>

          <label
            className="bet-label"
            htmlFor="blackjack-bet"
          >
            Bet amount
          </label>

          <input
            id="blackjack-bet"
            className="bet-input"
            type="number"
            min="1"
            step="10"
            value={betAmount}
            disabled={gameInProgress}
            onChange={(event) =>
              setBetAmount(event.target.value)
            }
          />

          <div className="quick-bets">
            {[10, 50, 100, 250].map((amount) => (
              <button
                type="button"
                key={amount}
                disabled={gameInProgress}
                onClick={() =>
                  setBetAmount(amount)
                }
              >
                {amount}
              </button>
            ))}
          </div>

          {gameStatus === "ready" && (
            <button
              type="button"
              className="spin-button"
              onClick={handleDeal}
              disabled={balance <= 0}
            >
              Deal cards
            </button>
          )}

          {gameStatus === "playing" && (
            <div className="blackjack-actions">
              <button
                type="button"
                className="hit-button"
                onClick={handleHit}
              >
                Hit
              </button>

              <button
                type="button"
                className="stand-button"
                onClick={handleStand}
              >
                Stand
              </button>
            </div>
          )}

          {gameStatus === "finished" && (
            <button
              type="button"
              className="spin-button"
              onClick={handleNewRound}
            >
              New round
            </button>
          )}

          <div className="game-message">
            {message}
          </div>

          <div className="blackjack-rules">
            <h4>Quick rules</h4>

            <p>
              Blackjack pays 3:2.
            </p>

            <p>
              Dealer stands on 17.
            </p>

            <p>
              A push returns your bet.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}