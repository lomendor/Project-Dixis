#!/usr/bin/env bash
set -euo pipefail

echo "↯ Preflight: pnpm typecheck (frontend)"
if ! command -v corepack >/dev/null 2>&1; then
  echo "❗ corepack not found"; exit 1
fi

pushd frontend >/dev/null
  corepack enable >/dev/null 2>&1 || true
  corepack prepare pnpm@9.12.0 --activate >/dev/null 2>&1 || true
  pnpm install --frozen-lockfile
  pnpm typecheck
popd >/dev/null

echo "✓ Preflight OK"
