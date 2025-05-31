#!/bin/bash

# Start  backend data retrieval
echo "Starting API data..."
#source venv/bin/activate
python backend/app.py &
cd StockAnalysis/backend/app.py
# Start frontend
echo "Starting UI..."
cd frontend
npm run dev

# Kill Python when React stops
trap "kill 0" EXIT