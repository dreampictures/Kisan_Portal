---
name: Staff auth flow
description: How staff login works with role-based PIN requirement
---

Login flow:
1. POST /api/admin/login — checks staff_users table by username/password (plaintext), falls back to ADMIN_USERNAME/ADMIN_PASSWORD env vars
2. Session stores: adminAuthenticated, staffRole, staffUsername, staffDisplayName, staffUserId
3. Admin role additionally requires 4-digit PIN (1103) stored as session.pinVerified=true
4. Other roles (state_meet_president, state_president) skip PIN entirely

use-auth.ts returns: isAuthenticated, needsPin, logout, role, username, displayName, isAdminRole, isMeetPresident, isStatePresident

**Why:** Admin panel has destructive actions (delete, card issue) so extra PIN layer. Presidents only do approvals so PIN not needed.
