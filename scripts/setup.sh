#!/bin/bash
set -e
echo "Kids AI Speaker - Setup"
cp config/.env.example config/.env 2>/dev/null || true
cp config/.migpt.example.js config/.migpt.js 2>/dev/null || true
mkdir -p logs data
docker pull idootop/mi-gpt:latest
echo "Setup done! Edit config files, then run ./scripts/start.sh"