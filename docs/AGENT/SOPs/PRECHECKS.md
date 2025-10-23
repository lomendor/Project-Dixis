# PRECHECKS — Local Preflight πριν από κάθε PR

## Τι τρέχουμε
```bash
scripts/preflight.sh
```

- Ενεργοποιεί corepack/pnpm (frontend)
- pnpm install --frozen-lockfile
- pnpm typecheck

## Γιατί
- Αποφεύγουμε TS λάθη (π.χ. μετονομασίες/διπλές δηλώσεις) πριν το push.

## Πότε
- Πριν από κάθε AG pass ή χειροκίνητο PR.
