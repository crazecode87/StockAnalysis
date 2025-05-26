import matplotlib
matplotlib.use('Agg')

from flask         import Flask, request, send_file, abort, jsonify
from flask_cors    import CORS
import yfinance     as yf
import mplfinance   as mpf
import io

app = Flask(__name__)
CORS(app)

@app.route('/api/ping')
def ping():
    return jsonify({'pong': True})

@app.route('/api/chart')
def chart():
    ticker   = request.args.get('ticker',   'AAPL')
    interval = request.args.get('interval', '1d')
    start    = request.args.get('start')
    end      = request.args.get('end')

    
    if not (start and end):
        return abort(400, "start and end query parameters are required")

    print(f">>> CHART HIT: {ticker=} {start=} {end=} {interval=}")

    # Fetch OHLCV by date range
    df = yf.Ticker(ticker).history(start=start, end=end, interval=interval)
    print("    df.shape:", df.shape)
    if df.empty:
        return abort(404, f"No data for {ticker} from {start} to {end} at {interval}")

    # Render into PNG
    buf = io.BytesIO()
    mpf.plot(
        df,
        type='candle',
        style='charles',
        title=f"{ticker} [{start} → {end}]  {interval}",
        ylabel='Price (USD)',
        savefig=dict(fname=buf, format='png', dpi=100)
    )
    buf.seek(0)
    return send_file(buf, mimetype='image/png')

if __name__ == '__main__':
    # change to 8000 or whatever port you prefer
    app.run(host='0.0.0.0', port=8000, debug=True)