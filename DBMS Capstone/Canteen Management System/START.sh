#!/bin/bash
# Mac / Linux: run with   bash START.sh
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Install Node.js (LTS) from https://nodejs.org first."; exit 1; }
[ -d backend/node_modules ]  || (cd backend  && npm install)
[ -d frontend/node_modules ] || (cd frontend && npm install)
(cd backend && npm start) &
sleep 6
(cd frontend && npm run dev) &
sleep 6
(open http://localhost:5173 2>/dev/null || xdg-open http://localhost:5173 2>/dev/null) 
echo "Running. Press Ctrl+C to stop."
wait
