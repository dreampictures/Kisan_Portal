---
name: Multi-level approval workflow
description: 3-stage approval system and how currentStage drives UI buttons
---

Stages: submitted → state_president_review → admin_review → approved → card_issued

Role-to-stage mapping:
- state_meet_president: acts on currentStage='submitted' → /meet-president-approve or /meet-president-reject
- state_president: acts on currentStage='state_president_review' → /state-president-approve or /state-president-reject
- admin: acts on any pending → /approve or /reject (reject now marks as rejected, does NOT delete)

**Why:** Registrations go through committee hierarchy before admin issues card. Old DELETE-to-reject was replaced with POST /reject that sets status='rejected', reason stored.

**How to apply:** PendingCard component checks `userRole` and `reg.currentStage` to show the right buttons. Tabs filter pending list by role.
