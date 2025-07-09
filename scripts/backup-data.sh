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

if [ ! -f "$script_dir/internal/data.sql" ]; then
  echo "SQL seed data file does not exists!"
  echo "Make sure you have a SQL file named 'data.sql' in scripts/internal dir."
  exit 1;
fi

destfilename="$(date '+%Y%m%d%H%M')_backup.sql"
destfilepath="$script_dir/internal/$destfilename"

echo "Backing up data, waiting 5s..."
sleep 5

bunx supabase db dump --data-only --db-url $DB_URL -f $destfilepath