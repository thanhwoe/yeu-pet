# 08 — Sitter Booking Plan

## 1. Product positioning

Phase 1 sitter booking should be a lightweight connection platform.

The app helps owners discover and contact sitters, but does not handle payment, delivery, insurance, or dispute resolution yet.

Copy should clearly say:

```txt
Payment and final service details are arranged directly between pet owner and sitter.
```

## 2. User roles

A user can be:

- Pet owner
- Sitter
- Both

One account can have one sitter profile.

## 3. Sitter profile fields

Required:

- address or service area
- hourly rate
- daily rate
- bio
- availability status

Recommended additions:

- display name
- city
- district
- ward
- latitude/longitude optional
- accepted pet types
- experience
- service notes
- profile image
- verified badge later

## 4. Booking flow

```txt
Owner browses sitters
→ Owner opens sitter profile
→ Owner selects pet
→ Owner selects hourly/daily
→ Owner chooses start/end time
→ Owner sends booking request
→ Sitter accepts or rejects
→ If accepted, booking becomes confirmed
→ Booking can become active/completed
→ Owner leaves rating/review
```

## 5. Status transitions

Allowed transitions:

```txt
pending -> confirmed
pending -> rejected
pending -> cancelled
confirmed -> active
confirmed -> cancelled
active -> completed
active -> cancelled
completed -> reviewed via review record
```

Do not allow:

- cancelled -> confirmed
- rejected -> confirmed
- completed -> cancelled
- review before completed
- duplicate review for same booking

## 6. APIs

### Sitter profile

```txt
GET    /sitters
GET    /sitters/:id
GET    /sitters/me
POST   /sitters/me
PATCH  /sitters/me
```

### Booking

```txt
GET    /sitter-bookings/me?role=owner|sitter&status=
POST   /sitter-bookings
GET    /sitter-bookings/:id
POST   /sitter-bookings/:id/accept
POST   /sitter-bookings/:id/reject
POST   /sitter-bookings/:id/cancel
POST   /sitter-bookings/:id/complete
POST   /sitter-bookings/:id/review
```

### Chat-ready

```txt
GET  /sitter-bookings/:id/messages
POST /sitter-bookings/:id/messages
```

## 7. Business rules

- Owner must own the selected pet.
- Sitter cannot book their own sitter profile.
- Sitter must be available.
- Booking start time must be before end time.
- For hourly booking, calculate by hours.
- For daily booking, calculate by days.
- `total_price` is estimated only if payment is outside app.
- Only booking participants can read booking detail/messages.
- Only sitter can accept/reject.
- Owner or sitter can cancel, but cancellation reason should be stored.
- Only owner can review, after completion.

## 8. Mobile screens

```txt
SitterListScreen
SitterFilterSheet
SitterProfileScreen
SitterRegistrationScreen
BookingRequestForm
BookingDetailScreen
BookingChatScreen optional
ReviewForm
```

## 9. Trust & Safety MVP

Minimum:

- Sitter profile clear enough.
- Rating/review visible.
- Report sitter/user option prepared.
- Block user prepared.
- Disclaimer about external payment.

Later:

- Phone/email verification
- ID verification
- Verified sitter badge
- In-app payment
- Cancellation policy
- Dispute support
- Insurance/guarantee

## 10. Phase 1 checklist

- [x] Update sitter profile schema.
- [x] Add booking message table if chat implemented.
- [x] Implement sitter registration API.
- [x] Implement sitter search API.
- [x] Implement booking request API.
- [x] Implement status transition actions.
- [x] Notify sitters about new requests and owners about sitter/system status changes.
- [x] Implement review/rating update.
- [x] Implement mobile sitter list/profile.
- [x] Implement booking request form.
- [x] Implement booking detail/status actions.
- [x] Show external payment disclaimer.
