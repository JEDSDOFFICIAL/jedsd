# Publish Permission Update

## Summary
Publishing papers is now restricted to **ADMIN users only**. Editors can accept/reject papers, but only administrators can perform the final publish action.

---

## Changes Made

### 1. Permissions Layer (`src/lib/permissions.ts`)
- **`canPublish()`** — now returns `true` only for ADMIN users
- Removed the `canPublish` flag delegation path (previously allowed granting publish permission to non-admins)

### 2. API Route (`src/app/api/paper/[paperId]/publish/route.ts`)
- Updated security comment to reflect ADMIN-only policy
- Updated error message: "Forbidden: only administrators can publish papers."
- Still uses `canPublish()` for the check, which now enforces ADMIN-only

### 3. Editor Final Decision Page (`src/app/dashboard/editor/final-decision/page.tsx`)
- Added `useSession()` hook
- Derived `isAdmin` flag from session user type
- **Publish Paper dropdown item** — now only visible when `status === "ACCEPTED" && isAdmin`
- **Publish confirmation dialog** — wrapped in `{isAdmin && (...)}`

### 4. Editor Paper Action Page (`src/app/dashboard/editor/paper-action/page.tsx`)
- Added `useSession()` hook
- Derived `isAdmin` flag from session user type
- **`getAvailableActions()`** — Publish action only added when `paper.status === "ACCEPTED" && isAdmin`

### 5. Admin Papers Page (`src/app/dashboard/admin/papers/page.tsx`)
- No changes needed — admins already have access to publish via their ADMIN role

---

## Behavior

### For Editors
- Can **accept** papers (status → ACCEPTED)
- Can **reject** papers (status → REJECTED)
- Can **edit** paper metadata (volume, issue, DOI, publication date, etc.)
- **Cannot** publish papers — the Publish button/action is hidden

### For Admins
- Full access to all editorial actions
- Can **publish** papers (status → PUBLISH/PUBLISHED)
- Can set volume, issue number, publication date, and DOI at the time of publishing

---

## Migration Notes

If any users were previously granted the `canPublish` flag:
- That flag is now ignored by the permission check
- Only users with `userType: ADMIN` or `variableUserType: ADMIN` can publish
- No database migration needed — the flag field remains in the schema but is not read

---

## Testing Checklist

- [ ] Editor logs in → goes to Final Decision page → sees Accept/Reject but NOT Publish for ACCEPTED papers
- [ ] Editor logs in → goes to Paper Action page → sees no Publish action for ACCEPTED papers
- [ ] Admin logs in → Final Decision page → sees Publish button for ACCEPTED papers
- [ ] Admin logs in → Paper Action page → sees Publish action for ACCEPTED papers
- [ ] Admin publishes a paper with volume/issue/DOI → values are saved correctly
- [ ] Non-admin attempts to call `/api/paper/[paperId]/publish` directly → receives 403 Forbidden
