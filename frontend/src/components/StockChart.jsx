import React, { useState, useEffect } from 'react'

export default function StockChart({ ticker, start, end, interval }) {
  const [imgSrc, setImgSrc] = useState(null)
  const [error,  setError]  = useState(null)

  useEffect(() => {
    if (!ticker || !start || !end) return

    const params = new URLSearchParams({
      ticker,
      start,
      end,
      interval,
      t: Date.now().toString(),
    })

    const url = `http://localhost:8000/api/chart?${params.toString()}`

    setError(null)
    setImgSrc(url)
  }, [ticker, start, end, interval])

  if (error) {
    return <div className="error">Error: {error}</div>
  }
  if (!imgSrc) {
    return null
  }
  return (
    <div className="chart-container">
      <img
        src={imgSrc}
        alt={`${ticker} chart`}
        onError={() => setError('Failed to load chart')}
        style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ccc' }}
      />
    </div>
  )
}
