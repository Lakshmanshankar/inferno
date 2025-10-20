#!/usr/bin/env bash

DEPS=("lucide-react" "react-router-dom")

FOLDERS=(
  "packages/editor"
  "packages/settings"
  "shared/ui"
  "shared/sample"
  "shared/firebase"
)

for folder in "${FOLDERS[@]}"; do
  if [ -f "$folder/package.json" ]; then
    echo "Removing React deps from $folder..."
    (cd "$folder" && pnpm remove "${DEPS[@]}")
  fi
done

echo "Done."
