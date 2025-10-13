# HOWTO: Τοπική Εκκίνηση Dixis (Local Dev)

## Προαπαιτούμενα
- Node.js ≥ 18, npm/pnpm/yarn
- Ελεύθερη πόρτα 3001

## 1) Εγκατάσταση
```bash
cd frontend
npm install  # ή pnpm/yarn
cp -n .env.example .env.local
```

Συμπλήρωσε στο `.env.local`:
```bash
OTP_BYPASS=000000
ADMIN_PHONES=+306900000084
DIXIS_ENV=local
```

## 2) Prisma (SQLite για local)
```bash
npx prisma db push
npx prisma generate
```

## 3) Εκκίνηση
```bash
PORT=3001 npm run dev -- -p 3001
# άνοιξε http://localhost:3001
```

## 4) Admin Login (dev)
- **Τηλέφωνο**: `+306900000084`
- **OTP**: `000000` (bypass)

## 5) Γρήγορο Smoke
```bash
npm run test:smoke
```

## Συχνά θέματα
- **Αν η 3001 είναι πιασμένη**: `PORT=3010 npm run dev -- -p 3010`
- **Αν το Prisma κολλήσει**: σβήσε `dev.db*` `wal/shm` και ξανά `prisma db push`
