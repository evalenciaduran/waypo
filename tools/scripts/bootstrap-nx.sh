#!/usr/bin/env bash
set -euo pipefail

# Run from repository root.

npx create-nx-workspace@latest tourism-platform \
  --preset=apps \
  --packageManager=npm \
  --interactive=false

cd tourism-platform
npx nx add @nx/angular
npx nx add @nx/playwright

# Create Ionic app shell after Nx setup. Keep this step aligned with current Ionic/Nx plugin support.
# If plugin support changes, generate Angular app with Nx and then integrate Ionic dependencies.
