import {
  wheelNumbers,
  getNumberColor
} from "../utils/roulette"



export default function RouletteWheel({
  rotation,
  isSpinning,
  result
}) {
  const segmentAngle = 360 / wheelNumbers.length

  return (
    <div className="roulette-wheel-container">
      <div className="roulette-pointer" />

      <div
        className="numbered-roulette-wheel"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? "transform 4s cubic-bezier(0.12, 0.76, 0.24, 1)"
            : "none"
        }}
      >
        <div className="roulette-segments">
          {wheelNumbers.map((number, index) => {
            const angle = index * segmentAngle
            const color = getNumberColor(number)

            return (
              <div
                key={number}
                className={`roulette-number ${color}`}
                style={{
                  transform: `
                    rotate(${angle}deg)
                    translateY(-142px)
                    rotate(${-angle}deg)
                  `
                }}
              >
                {number}
              </div>
            )
          })}
        </div>

        <div className="roulette-inner-ring" />

        <div className="roulette-center-cap">
          {result ? result.number : "?"}
        </div>
      </div>
    </div>
  )
}
