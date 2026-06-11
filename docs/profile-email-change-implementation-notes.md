# Profile Email Change Implementation Notes

## Current YeuPet Issues

- `PATCH /me` currently accepts `email` and updates `accounts.email` directly. Email must be removed from direct profile updates.
- Auth OTP uses `otp_tokens` with a raw token and no attempts/resend policy, so it is not suitable for profile email changes.
- The shared email module has Resend integration and `email_logs`/`email_suppressions`, but send failures are recorded and returned rather than surfaced to callers that need delivery acceptance.
- Avatar update already exists at `POST /me/avatar` and queues upload work through the file upload worker.

## Smart Booking Patterns Used As Reference

- Centralized email service with a Resend provider initialized from environment variables.
- Small typed email template functions that return `{ subject, html, text }`.
- Email logs with explicit status transitions and Resend ids.
- Suppression checks before sending.
- Resend webhook handling for delivery/bounce/complaint events with Svix signature verification.
- Re-throwing send failures in worker paths so retries can happen.
- Resend SDK usage should check `{ data, error }` explicitly because SDK API errors are returned, not thrown.
- Idempotency keys should be attached to transactional sends to avoid duplicate OTP delivery during retries.

## Chosen Approach

- Add a dedicated `email_change_requests` table instead of reusing auth OTP storage.
- Store only a bcrypt hash of the OTP.
- Keep email change request, verify, resend, and cancel APIs under canonical `/me`.
- Leave auth/register/verify OTP behavior unchanged.
- Add `EmailService.sendEmailChangeOtpEmail(...)` and make this method throw when the email is suppressed or Resend fails.
- Re-integrate the shared email module with the official Resend SDK, idempotent sends, and verified webhook processing.
- Process Resend delivery events to update email logs and suppress hard bounces/complaints.

## DB Changes Required

- Add `email_change_status` enum with `pending`, `verified`, `expired`, `cancelled`.
- Add `email_change_requests` table with account relation, normalized new email, OTP hash, attempts, resend count, send/expiry timestamps, status timestamps, and indexes.
- Add `accounts.email_change_requests` relation.

## API Changes Required

- Update `PATCH /me` to only update safe profile fields such as `firstName` and `lastName`.
- Add:
  - `POST /me/email-change/request`
  - `POST /me/email-change/verify`
  - `POST /me/email-change/resend`
  - `POST /me/email-change/cancel`
- Enforce email normalization, duplicate checks, ownership, expiration, attempt limits, resend cooldown, and re-check uniqueness at verification.

## Frontend Changes Required

- Settings `Edit` navigates to a full Profile Detail screen instead of opening the bottom sheet.
- Profile Detail supports first/last name updates, avatar selection/upload, and email-change request.
- Email verification route collects a 6-digit OTP, supports resend/cancel, and updates the persisted user after verification.
- Add mobile API helpers for `/me`, `/me/avatar`, and `/me/email-change/*`.
- Update `docs/12-mobile-api-contract.md` and env examples for email OTP settings.
