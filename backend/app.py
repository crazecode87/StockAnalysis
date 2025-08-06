import asyncio
import json
import os

from flask import Flask, request, abort, jsonify, Response, stream_with_context

from client import get_client
from schwab.streaming import StreamClient

app = Flask(__name__)


@app.after_request
def add_cors_headers(resp):
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

TIMEFRAMES = {
    "1m": dict(periodType="day", period=1, frequencyType="minute", frequency=1),
    "5m": dict(periodType="day", period=1, frequencyType="minute", frequency=5),
    "15m": dict(periodType="day", period=1, frequencyType="minute", frequency=15),
    "30m": dict(periodType="day", period=1, frequencyType="minute", frequency=30),
    "1h": dict(periodType="day", period=1, frequencyType="minute", frequency=60),
    "1d": dict(periodType="month", period=1, frequencyType="daily", frequency=1),
    "1w": dict(periodType="year", period=1, frequencyType="weekly", frequency=1),
    "1M": dict(periodType="year", period=1, frequencyType="monthly", frequency=1),
}

@app.route('/api/ping')
def ping():
    return jsonify({'pong': True})

@app.route('/api/search')
def search():
    query = request.args.get('q')
    if not query:
        return abort(400, 'q parameter required')
    client = get_client()
    resp = client.search_instruments(query, projection='symbol-search')
    items = resp.json()
    results = [
        {'symbol': symbol, 'description': info.get('description', '')}
        for symbol, info in items.items()
    ]
    return jsonify(results)

@app.route('/api/ohlc')
def ohlc():
    symbol = request.args.get('symbol')
    timeframe = request.args.get('timeframe', '1d')
    if not symbol:
        return abort(400, 'symbol is required')
    params = TIMEFRAMES.get(timeframe)
    if not params:
        return abort(400, 'invalid timeframe')
    client = get_client()
    resp = client.get_price_history(symbol, **params)
    data = resp.json().get('candles', [])
    candles = [
        {
            'time': int(item['datetime']) // 1000,
            'open': item['open'],
            'high': item['high'],
            'low': item['low'],
            'close': item['close'],
            'volume': item['volume'],
        }
        for item in data
    ]
    return jsonify(candles)

@app.route('/api/stream/<symbol>')
def stream(symbol):
    async def streamer():
        client = get_client()
        stream_client = StreamClient(client, account_id=os.getenv("account_id"))
        await stream_client.login()
        await stream_client.quality_of_service(StreamClient.QOSLevel.EXPRESS)
        await stream_client.chart_equity_sub(symbol)
        async for msg in stream_client.message_generator():
            for m in msg:
                if m.get("service") == "CHART_EQUITY":
                    c = m["content"][0]
                    yield {
                        'time': c['TIMESTAMP'] // 1000,
                        'open': c['OPEN_PRICE'],
                        'high': c['HIGH_PRICE'],
                        'low': c['LOW_PRICE'],
                        'close': c['CLOSE_PRICE'],
                        'volume': c['TOTAL_VOLUME'],
                    }

    def generate():
        loop = asyncio.new_event_loop()
        gen = streamer()
        try:
            while True:
                candle = loop.run_until_complete(gen.__anext__())
                yield f"data: {json.dumps(candle)}\n\n"
        except StopAsyncIteration:
            pass

    return Response(stream_with_context(generate()), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
