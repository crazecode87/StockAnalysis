import { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'

export default function StockChart({ symbol, timeframe }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!symbol) return
    const chart = createChart(containerRef.current, { width: 600, height: 400 })
    const candleSeries = chart.addCandlestickSeries()

    async function load() {
      const params = new URLSearchParams({ symbol, timeframe })
      const resp = await fetch(`http://localhost:8000/api/ohlc?${params.toString()}`)
      const data = await resp.json()
      candleSeries.setData(data)
    }

    load()

    const source = new EventSource(`http://localhost:8000/api/stream/${symbol}`)
    source.onmessage = e => {
      const candle = JSON.parse(e.data)
      candleSeries.update(candle)
    }

    return () => {
      source.close()
      chart.remove()
    }
  }, [symbol, timeframe])

  return <div ref={containerRef} />
}
