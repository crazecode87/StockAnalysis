// src/App.jsx
import { useState } from 'react'
import StockChart from './components/StockChart'
import './App.css'

export default function App() {
  const today = new Date().toISOString().slice(0, 10)
  const priorMonth = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)

  const [ticker, setTicker] = useState('AAPL')
  const [start, setStart] = useState(priorMonth)
  const [end, setEnd] = useState(today)
  const [interval, setInterval] = useState('1d')

  // Zoom: factor <1 zooms in, >1 zooms out
  function zoom(factor) {
    const s = new Date(start)
    const e = new Date(end)
    const mid = (s.getTime() + e.getTime()) / 2
    const half = ((e.getTime() - s.getTime()) / 2) * factor
    setStart(new Date(mid - half).toISOString().slice(0, 10))
    setEnd(new Date(mid + half).toISOString().slice(0, 10))
  }

  // Pan by fraction of current window (shift >0 moves right, <0 moves left)
  function pan(fraction) {
    const s = new Date(start)
    const e = new Date(end)
    const span = e.getTime() - s.getTime()
    const delta = span * fraction
    setStart(new Date(s.getTime() + delta).toISOString().slice(0, 10))
    setEnd(new Date(e.getTime() + delta).toISOString().slice(0, 10))
  }

  return (
    <div className="app">
      <div className="toolbar">
        <input
          type="text"
          value={ticker}
          onChange={e => setTicker(e.target.value.toUpperCase())}
          placeholder="Ticker (e.g. AAPL)"
        />

        <label>
          Start:
          <input
            type="date"
            value={start}
            onChange={e => setStart(e.target.value)}
          />
        </label>

        <label>
          End:
          <input
            type="date"
            value={end}
            onChange={e => setEnd(e.target.value)}
          />
        </label>

        <label>
          Interval:
          <select
            value={interval}
            onChange={e => setInterval(e.target.value)}
          >
            <option value="1mo">1 Month</option>
            <option value="1wk">1 Week</option>
            <option value="1d">1 Day</option>
            <option value="4h">4 Hours</option>
            <option value="1h">1 Hour</option>
            <option value="15m">15 Min</option>
            <option value="5m">5 Min</option>
            <option value="1m">1 Min</option>
          </select>
        </label>

        {/* Zoom Controls */}
        <button onClick={() => zoom(0.5)}>Zoom In</button>
        <button onClick={() => zoom(2)}>Zoom Out</button>

        {/* Pan Controls */}
        <button
          onClick={() => pan(-0.5)}
          aria-label="Pan Left"
          title="Pan Left"
        >←</button>
        <button
          onClick={() => pan(0.5)}
          aria-label="Pan Right"
          title="Pan Right"
        >→</button>
      </div>

      <StockChart
        ticker={ticker}
        start={start}
        end={end}
        interval={interval}
      />
    </div>
  )
}