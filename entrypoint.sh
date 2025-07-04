#!/bin/sh
set -e

# Install bun
npm i -g bun

# Run migrations
bunx supabase migration up --db-url $DB_URL

# Start the app
node .output/server/index.mjs