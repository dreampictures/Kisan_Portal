---
name: Tracking ID system
description: TRK-XXXXXX IDs for public registration tracking
---

- Every registration gets a trackingId (TRK-XXXXXX, 6 random digits) on creation in storage.createRegistration
- Public endpoint: GET /api/track?trackingId=TRK-XXXXXX or ?mobile=0123456789 (no auth required)
- After registration submit, response includes { message, id, trackingId }
- Contact.tsx shows SuccessModal with the trackingId — modal not dismissable by backdrop/escape, only OK button
- /track page has search by TRK-XXXXXX or 10-digit mobile number, shows timeline with progress bar

**Why:** Members need a way to check approval status without an account. Card numbers (KSCPKB-XXXXXX) are separate and only assigned at card_issued stage.
