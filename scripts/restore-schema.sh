#!/bin/bash

script_dir="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
while getopts "e:" opt; do
  case $opt in
    e)
      ENV_TYPE_RAW="$OPTARG"
      ;;
    *)
      echo "Usage: $0 -e [production|staging]"
      exit 1
      ;;
  esac
done

if [[ "$ENV_TYPE_RAW" == "production" ]]; then
  ENV_FILE=".env.production"
elif [[ "$ENV_TYPE_RAW" == "staging" ]]; then
  ENV_FILE=".env.staging"
else
  echo "Invalid environment type. Use 'production' or 'staging'."
  exit 1
fi

source "$script_dir/$ENV_FILE"

echo "Migrating database, this process is destructive! Waiting 5s..."
sleep 5

bunx supabase migration up --db-url $DB_URL