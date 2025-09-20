# Reports Directory

This directory contains generated reports for various system operations.

## How to Run Calibration

1. Prepare CSV with actual order data (see template: `docs/samples/orders-20.template.csv`)
2. Run calibration: `make calibrate` (from project root)
3. Review report: `backend/docs/reports/<YYYY-MM-DD>/CALIBRATION-REPORT.md`
4. Apply suggested adjustments to `config/shipping/rates.gr.json` if needed
5. Re-run calibration to verify improvements