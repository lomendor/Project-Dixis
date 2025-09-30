---
title: PRD v2 — Δεδομένα: Εικονικές Επισκέψεις
last_updated: 2025-09-29
source: "PRD/PRD Dixis Τελικό .docx.md (§2.4.5)"
---

# Εικονικές Επισκέψεις & Συνεδρίες

## Virtual_Tours
- id, producer_id, title, description, thumbnail, video_url, virtual_tour_type (pre-recorded/live/360/interactive), duration_minutes, is_premium, status, view_count, timestamps.

## Live_Sessions
- id, producer_id, title, description, thumbnail, session_type (farm-tour/Q&A/workshop/masterclass), streaming_url, scheduled_at, duration_minutes, max_participants, is_premium, price, status, recording_url, timestamps.

## Session_Registrations
- id, session_id, user_id, business_id?, registration_time, attendance_status, payment_status, payment_amount, feedback_rating, feedback_comment, timestamps.

