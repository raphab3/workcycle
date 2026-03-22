#!/bin/sh

set -eu

echo "[backend] Installing dependencies"
npm install

echo "[backend] Applying database migrations"
npm run db:migrate

echo "[backend] Starting development server"
exec npm run dev