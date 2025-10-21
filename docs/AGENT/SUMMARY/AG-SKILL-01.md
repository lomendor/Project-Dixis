# AG-SKILL-01 — Dixis Skill v1 Package

**Date**: 2025-10-21  
**Purpose**: Build reusable Claude skill package for Dixis AG workflow

## Deliverable

**ZIP Package**: `dixis-skill_v1.zip` (48KB, 14 files)

### Structure
```
.dixis-skill/
├── SKILL.md              # Metadata, activation cues, rules
├── README.txt            # Installation/usage instructions
├── context/              # 9 files (121KB context)
│   ├── README.md
│   ├── STATE.md          # Current project state
│   ├── architecture.md
│   ├── routes.md
│   ├── env.md
│   ├── db-schema.md
│   ├── SOP-Feature-Pass.md
│   ├── SOP-PDAC-lite.md
│   └── SOP-Context-Hygiene.md
└── prompts/
    └── PassTemplate.md   # Standard pass structure
```

## Usage

### Installation
1. **Claude Web**: Settings → Skills → Upload `dixis-skill_v1.zip` → Enable
2. **Claude Code**: Copy to `~/.claude/skills/dixis/`

### Activation Cues
- "AGxx / Pass / UltraThink"
- "Normalize PR #..."
- "Status snapshot"
- "Next pass from STATE"

## Features

### Pass Orchestration
- Standardized AG pass template
- PR hygiene enforcement (Reports, Test Summary)
- Auto-merge workflow
- STRICT NO-VISION path validation

### Context Management
- Complete project state (STATE.md)
- SOPs for feature passes, PDAC-lite, context hygiene
- Architecture, routes, DB schema docs
- Environment configuration guide

### CI/CD Integration
- Playwright/E2E test patterns
- SQLite (smoke) vs PostgreSQL (pg-e2e) strategy
- pnpm + corepack setup
- Danger.js integration

## Guardrails
- EL-first (Greek primary language)
- Explicit absolute paths only
- Small, focused PRs (<300 LOC)
- Label requirements: `ai-pass`, `risk-ok`, `ui-only` (when applicable)

## Future Enhancements (AG-SKILL-02+)
- Interactive pass selector
- Automated STATE.md sync
- PR template generator
- E2E test scaffolder
