import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './ActiveLearningGame.css'

// A noiseless version-space demonstration, NOT logistic regression.
// Each correct label removes candidate lines that disagree with that label.
// The remaining candidates never contradict a previously supplied label.

type Point = { x: number; y: number }
type Line = { m: number; b: number }
type ClassLabel = 1 | -1
type LabeledPoint = { index: number; label: ClassLabel }
type Strategy = 'active' | 'random'
type Game = {
  possible: Line[]
  labeled: LabeledPoint[]
  nextIndex: number
  message: string
}

const TRUE_LINE: Line = { m: 0.6, b: 0.225 }
const CANVAS_SIZE = 800
const EDGE = 50
const PLOT_SIZE = 700
const xPx = (x: number) => EDGE + PLOT_SIZE * x
const yPx = (y: number) => CANVAS_SIZE - EDGE - PLOT_SIZE * y

function makeRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
}

function makePoints(): Point[] {
  const random = makeRandom(42891) // Same dataset after each reset.
  return Array.from({ length: 360 }, () => ({
    x: 0.035 + 0.93 * random(),
    y: 0.035 + 0.93 * random(),
  }))
}

function makeLines(): Line[] {
  const lines: Line[] = []
  for (let im = 0; im <= 48; im++) {
    const m = -1.2 + im * 0.05
    for (let ib = 0; ib <= 52; ib++) {
      lines.push({ m, b: -0.15 + ib * 0.025 })
    }
  }
  return lines // 49 * 53 = 2597 candidate lines, including the true line.
}

function classify(line: Line, point: Point): ClassLabel {
  return point.y > line.m * point.x + line.b ? 1 : -1
}

function pickNext(
  points: Point[],
  possible: Line[],
  labeled: LabeledPoint[],
  strategy: Strategy,
): number {
  const used = new Set(labeled.map((item) => item.index))
  const available = points.map((_, index) => index).filter((i) => !used.has(i))
  if (available.length === 0 || possible.length <= 1) return -1

  if (strategy === 'random') {
    const random = makeRandom(9001 + labeled.length * 929)
    return available[Math.floor(random() * available.length)]
  }

  let bestIndex = available[0]
  let bestScore = -Infinity

  for (const i of available) {
    const point = points[i]
    let votesForRed = 0
    for (const line of possible) {
      if (classify(line, point) === 1) votesForRed++
    }
    const fractionRed = votesForRed / possible.length
    const disagreement = 4 * fractionRed * (1 - fractionRed)

    let distance = 1
    if (labeled.length > 0) {
      distance = Infinity
      for (const old of labeled) {
        const p = points[old.index]
        distance = Math.min(distance, Math.hypot(point.x - p.x, point.y - p.y))
      }
    }

    // Disagreement is the main criterion. Slight preference for novel locations.
    const score = disagreement * (1 + 0.22 * Math.min(distance, 1))
      + 0.0001 * Math.abs(point.x - 0.5)
    if (score > bestScore) {
      bestScore = score
      bestIndex = i
    }
  }
  return bestIndex
}

function freshGame(points: Point[], strategy: Strategy): Game {
  const possible = makeLines()
  return {
    possible,
    labeled: [],
    nextIndex: pickNext(points, possible, [], strategy),
    message: 'Start by labeling the gold star. The model has not seen any labels yet.',
  }
}

function drawPlot(canvas: HTMLCanvasElement, points: Point[], game: Game, showTruth: boolean): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  ctx.fillStyle = '#f9fafd'
  ctx.fillRect(EDGE, EDGE, PLOT_SIZE, PLOT_SIZE)

  ctx.strokeStyle = '#e4e8f0'
  ctx.lineWidth = 1
  for (let i = 0; i <= 10; i++) {
    const v = i / 10
    ctx.beginPath()
    ctx.moveTo(xPx(v), yPx(0))
    ctx.lineTo(xPx(v), yPx(1))
    ctx.moveTo(xPx(0), yPx(v))
    ctx.lineTo(xPx(1), yPx(v))
    ctx.stroke()
  }

  const strokeLine = (line: Line, color: string, width: number, dash: number[] = []) => {
    ctx.beginPath()
    ctx.moveTo(xPx(0), yPx(line.b))
    ctx.lineTo(xPx(1), yPx(line.m + line.b))
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.setLineDash(dash)
    ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.save()
  ctx.beginPath()
  ctx.rect(EDGE, EDGE, PLOT_SIZE, PLOT_SIZE)
  ctx.clip()

  if (game.possible.length > 0) {
    const low: Point[] = []
    const high: Point[] = []
    for (let i = 0; i <= 100; i++) {
      const x = i / 100
      let min = Infinity
      let max = -Infinity
      for (const line of game.possible) {
        const y = line.m * x + line.b
        min = Math.min(min, y)
        max = Math.max(max, y)
      }
      low.push({ x, y: min })
      high.push({ x, y: max })
    }
    ctx.beginPath()
    low.forEach((point, i) => {
      if (i === 0) ctx.moveTo(xPx(point.x), yPx(point.y))
      else ctx.lineTo(xPx(point.x), yPx(point.y))
    })
    for (let i = high.length - 1; i >= 0; i--) {
      ctx.lineTo(xPx(high[i].x), yPx(high[i].y))
    }
    ctx.closePath()
    ctx.fillStyle = 'rgba(132,81,202,0.13)'
    ctx.fill()

    let totalM = 0
    let totalB = 0
    for (const line of game.possible) {
      totalM += line.m
      totalB += line.b
    }
    strokeLine(
      { m: totalM / game.possible.length, b: totalB / game.possible.length },
      '#7843ba', 5,
    )
  }

  if (showTruth) strokeLine(TRUE_LINE, '#777f8e', 4, [12, 9])

  const used = new Set(game.labeled.map((item) => item.index))
  points.forEach((point, index) => {
    if (used.has(index)) return
    ctx.beginPath()
    ctx.arc(xPx(point.x), yPx(point.y), 3.2, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(94,110,132,0.35)'
    ctx.fill()
  })

  for (const { index, label } of game.labeled) {
    const point = points[index]
    ctx.beginPath()
    ctx.arc(xPx(point.x), yPx(point.y), 7.1, 0, Math.PI * 2)
    ctx.fillStyle = label === 1 ? '#d84453' : '#326cda'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  if (game.nextIndex >= 0) {
    const point = points[game.nextIndex]
    const cx = xPx(point.x)
    const cy = yPx(point.y)
    ctx.beginPath()
    ctx.arc(cx, cy, 23, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,193,50,0.24)'
    ctx.fill()
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + i * Math.PI / 5
      const radius = i % 2 === 0 ? 13 : 6.11
      const x = cx + radius * Math.cos(angle)
      const y = cy + radius * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fillStyle = '#fbbf24'
    ctx.fill()
    ctx.strokeStyle = '#6f4a00'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  ctx.restore()
  ctx.strokeStyle = '#b7c2d3'
  ctx.lineWidth = 1
  ctx.strokeRect(EDGE, EDGE, PLOT_SIZE, PLOT_SIZE)
  ctx.fillStyle = '#7b879a'
  ctx.font = '16px system-ui'
  ctx.fillText('x', CANVAS_SIZE - 32, CANVAS_SIZE - 40)
  ctx.fillText('y', 33, 37)
}

export default function ActiveLearningGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const points = useMemo(makePoints, [])
  const [strategy, setStrategy] = useState<Strategy>('active')
  const [showTruth, setShowTruth] = useState(true)
  const [game, setGame] = useState<Game>(() => freshGame(points, 'active'))

  const answer = useCallback((label: ClassLabel) => {
    setGame((previous) => {
      if (previous.nextIndex < 0) return previous
      const point = points[previous.nextIndex]
      const correctLabel = classify(TRUE_LINE, point)
      if (correctLabel !== label) {
        return {
          ...previous,
          message: `That point is on the ${correctLabel === 1 ? 'RED (above)' : 'BLUE (below)'} side of the grey line. Try again; no incorrect label was added.`,
        }
      }

      const labeled = [...previous.labeled, { index: previous.nextIndex, label }]
      const possible = previous.possible.filter((line) => classify(line, point) === label)
      const eliminated = previous.possible.length - possible.length
      const nextIndex = pickNext(points, possible, labeled, strategy)
      return {
        possible,
        labeled,
        nextIndex,
        message: possible.length === 1
          ? `You found the line in ${labeled.length} labels! Reset to compare active and random sampling.`
          : `Good! Your label ruled out ${eliminated.toLocaleString()} candidate lines. ${possible.length.toLocaleString()} remain. ${nextIndex >= 0 ? 'Now label the next gold star.' : 'No unlabeled points remain.'}`,
      }
    })
  }, [points, strategy])

  useEffect(() => {
    if (canvasRef.current) drawPlot(canvasRef.current, points, game, showTruth)
  }, [points, game, showTruth])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return
      if (event.key.toLowerCase() === 'r') answer(1)
      if (event.key.toLowerCase() === 'b') answer(-1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [answer])

  const reset = () => setGame(freshGame(points, strategy))
  const changeStrategy = (next: Strategy) => {
    setStrategy(next)
    setGame(freshGame(points, next))
  }

  return (
    <main className="alg">
      <div className="alg-shell">
       {/* <a className="alg-home" href="/">← Home</a> */}
        <h1>Active Learning: Can You Find the Line?</h1>
        <p className="alg-subtitle">You are the labeling expert. The model chooses which point to ask about next. How few labels can it use?</p>

        <div className="alg-layout">
          <section className="alg-panel" aria-label="Classification playground">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              aria-label="Plot with grey true boundary, purple model boundary, and a gold star marking the next point to label"
              role="img"
            />
            <div className="alg-legend">
              <span><i className="alg-key alg-truth" />Grey dashed: true line</span>
              <span><i className="alg-key alg-model" />Purple: current model</span>
              <span><i className="alg-key alg-band" />Purple shading: possible lines</span>
              <span><i className="alg-key alg-query" />Gold star: next question</span>
            </div>
          </section>

          <aside className="alg-panel">
            <h2>Label the selected point</h2>
            <p className="alg-instructions">
              Above the <strong>grey dashed line</strong> is <strong className="alg-red-text">red</strong>.
              Below is <strong className="alg-blue-text">blue</strong>. Choose its correct label.
            </p>

            <div className="alg-metrics">
              <div className="alg-metric"><div className="alg-number">{game.labeled.length}</div><div className="alg-name">Points labeled</div></div>
              <div className="alg-metric"><div className="alg-number">{game.possible.length.toLocaleString()}</div><div className="alg-name">Possible lines left</div></div>
            </div>
            <div className="alg-buttons">
              <button className="alg-red-btn" onClick={() => answer(1)} disabled={game.nextIndex < 0}>Label RED (R)</button>
              <button className="alg-blue-btn" onClick={() => answer(-1)} disabled={game.nextIndex < 0}>Label BLUE (B)</button>
            </div>
            <p className="alg-status" role="status" aria-live="polite">{game.message}</p>

            <div className="alg-setting">
              <label htmlFor="alg-strategy">How does the model choose the next point?</label>
              <select id="alg-strategy" value={strategy} onChange={(e) => changeStrategy(e.target.value as Strategy)}>
                <option value="active">Active learning: maximum disagreement</option>
                <option value="random">Passive learning: random point</option>
              </select>
              <button className="alg-reset" onClick={reset}>↻ Reset with the same data</button>
            </div>

            <label className="alg-toggle">
              <input type="checkbox" checked={showTruth} onChange={(e) => setShowTruth(e.target.checked)} />
              Show the true (grey) decision boundary
            </label>
            <p className="alg-note"><strong>What cannot happen?</strong> The purple boundary will never misclassify a point you already labeled correctly. The purple uncertainty region can only shrink.</p>
            <p className="alg-note"><strong>Try in class:</strong> Label 10 points using active learning. Reset, choose random sampling, and label 10 points again. Compare the number of possible lines left.</p>
          </aside>
        </div>

        <section className="alg-bottom">
          <h2>What is this model actually doing?</h2>
          <p>It starts with 2,597 possible straight-line classifiers. Each correct label permanently eliminates lines that disagree with it. The purple line averages the remaining candidates; the shaded band shows their range. Active learning asks about a point where these candidates disagree most.</p>
          <p><strong>Note:</strong> This is a simple, noiseless <em>version-space</em> model, not logistic regression. A fitted classifier can move non-monotonically as new data arrives. Here the set of consistent lines only shrinks, even though the purple line itself can still move either way.</p>
        </section>
      </div>
    </main>
  )
}
