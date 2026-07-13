const suits = ["♠", "♥", "♦", "♣"]

const ranks = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K"
]

export function createDeck() {
  const deck = []

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        rank,
        suit,
        id: `${rank}-${suit}-${crypto.randomUUID()}`
      })
    }
  }

  return shuffleDeck(deck)
}

export function shuffleDeck(deck) {
  const shuffled = [...deck]

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1)
    )

    const temporaryCard = shuffled[index]
    shuffled[index] = shuffled[randomIndex]
    shuffled[randomIndex] = temporaryCard
  }

  return shuffled
}

export function calculateHandValue(hand) {
  let total = 0
  let aces = 0

  for (const card of hand) {
    if (["J", "Q", "K"].includes(card.rank)) {
      total += 10
    } else if (card.rank === "A") {
      total += 11
      aces += 1
    } else {
      total += Number(card.rank)
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10
    aces -= 1
  }

  return total
}

export function isBlackjack(hand) {
  return hand.length === 2 &&
    calculateHandValue(hand) === 21
}

export function isRedSuit(suit) {
  return suit === "♥" || suit === "♦"
}