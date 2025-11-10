# Backup & Restore SOP (Neon)

- **Backups**: Neon automated daily backups (default retention 7d).
- **Owner**: ops@dixis.io
- **Weekly drill (Fri)**:
  1) Create **staging** branch from production.
  2) Restore latest backup to staging.
  3) Run smoke: `/api/products`, `/api/checkout` on staging.
  4) Document result in docs/OPS/STATE.md.
- **Emergency restore**:
  - Decide RPO/RTO, restore to new branch, switch app `DATABASE_URL`, announce downtime.
