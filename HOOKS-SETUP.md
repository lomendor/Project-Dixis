# Git Hooks Setup

## Overview
This project uses **Husky** and **lint-staged** to enforce code quality standards before commits.

## What's Configured
- **Pre-commit hook**: Runs ESLint and TypeScript checks on staged files
- **ESLint**: Zero warnings policy (`--max-warnings=0`)
- **TypeScript**: Type checking without emit (`tsc --noEmit`)

## Setup (First Time)
```bash
# From project root
cd frontend
npm install

# Hooks are automatically set up via the "prepare" script
```

## How It Works
When you commit changes:
1. Pre-commit hook triggers automatically
2. `lint-staged` runs on staged `.js/.jsx/.ts/.tsx` files
3. ESLint checks for errors and warnings
4. TypeScript validates types
5. **Commit fails** if any errors or warnings are found

## Manual Testing
```bash
# Test the hook manually
cd frontend
npx lint-staged

# Or test individual commands
npm run lint      # ESLint check
npm run type-check # TypeScript check
```

## Troubleshooting
- **Hook not running**: Ensure `.husky/pre-commit` is executable
- **ESLint errors**: Fix code issues or add eslint-disable comments
- **TypeScript errors**: Resolve type issues
- **Performance**: Only staged files are checked, not entire codebase

## File Structure
```
.husky/
├── pre-commit          # Git hook script
frontend/
├── package.json        # Contains lint-staged config
└── eslint.config.mjs   # ESLint rules
```