import { useState, useEffect } from 'react'
import StockChart from './components/StockChart'
import './App.css'

const TIMEFRAMES = ['1m','5m','15m','30m','1h','1d','1w','1M']

export default function App() {
  const [symbol, setSymbol] = useState('AAPL')
  const [timeframe, setTimeframe] = useState('1d')
  const [watchlist, setWatchlist] = useState(['AAPL'])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    if (query.length < 1) { setResults([]); return }
    const controller = new AbortController()
    fetch(`http://localhost:8000/api/search?q=${query}`, { signal: controller.signal })
      .then(res => res.json())
      .then(setResults)
      .catch(() => {})
    return () => controller.abort()
  }, [query])

  function addToWatchlist(sym) {
    if (!watchlist.includes(sym)) setWatchlist([...watchlist, sym])
    setSymbol(sym)
    setQuery('')
    setResults([])
  }

  function removeSymbol(sym) {
    setWatchlist(watchlist.filter(s => s !== sym))
  }

  return (
    <div className="app">
      <div className="search-bar">
        <input
          value={query}
          onChange={e => setQuery(e.target.value.toUpperCase())}
          placeholder="Search symbol" />
        {results.length > 0 && (
          <ul className="results">
            {results.map(r => (
              <li key={r.symbol} onClick={() => addToWatchlist(r.symbol)}>
                {r.symbol} - {r.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="watchlist">
        {watchlist.map(sym => (
          <div key={sym} className="watch-item" onClick={() => setSymbol(sym)}>
            {sym}
            <button onClick={e => { e.stopPropagation(); removeSymbol(sym) }}>x</button>
          </div>
        ))}
      </div>

      <div className="timeframes">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf}
            className={tf === timeframe ? 'active' : ''}
            onClick={() => setTimeframe(tf)}>
            {tf}
          </button>
        ))}
      </div>

      <StockChart symbol={symbol} timeframe={timeframe} />
    </div>
  )
}
