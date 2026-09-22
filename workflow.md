You are working on the existing JEDSD journal/manuscript-management website.

Your task is to **first deeply audit the complete existing codebase and understand how the current system works**, and then implement/repair the complete journal editorial workflow described below.

Do NOT blindly create new APIs, database models, pages, or duplicate functionality.

Reuse and extend the existing JEDSD architecture wherever possible.

The final workflow must support:

AUTHOR SUBMISSION
→ EDITOR
→ REVIEWER ASSIGNMENT
→ REVIEWER REVIEW
→ EDITOR REVIEW
→ EDITOR DECISION
→ REVISION REQUEST
→ AUTHOR REVISION
→ EDITOR RECEIVES REVISION FILES
→ EDITOR DECIDES WHETHER TO REASSIGN REVIEWERS
→ OPTIONAL SECOND REVIEW ROUND
→ EDITOR DECISION
→ ACCEPTANCE
→ PRE-PUBLICATION
→ FINAL FILES
→ DOI
→ FINAL PUBLICATION

IMPORTANT UPDATED REQUIREMENT:

When an author submits a revised manuscript, the **revised manuscript, LaTeX/source ZIP files, and cover letter must go ONLY to the Editor first**.

Reviewers must NOT automatically receive the revised files.

The Editor can inspect the revised submission and, if required, manually assign/reassign reviewers for another review round.

---

# 1. MANDATORY FIRST STEP — FULL PROJECT AUDIT

Before modifying any code, inspect the entire repository.

Understand:

* Framework and version
* Frontend architecture
* Backend/API architecture
* Routing
* Authentication
* Authorization/RBAC
* Database
* Prisma schema
* Manuscript models
* Review models
* Reviewer assignment models
* Revision models
* File models
* Publication models
* DOI implementation
* Existing manuscript statuses
* Existing review workflow
* Existing revision workflow
* Existing dashboards
* Author pages
* Reviewer pages
* Editor pages
* Admin pages
* Public publication pages
* Pre-publication pages
* File upload/storage system
* Notification/email system
* Audit/history system

Search thoroughly for:

manuscript
submission
review
reviewer
editor
author
admin
revision
decision
accepted
rejected
publication
published
pre-publication
DOI
source
latex
cover letter
file
upload
download
abstract
affiliation
comments
response
status
history
timeline
notification
email

Inspect:

* API routes
* Server actions
* Controllers
* Services
* Database queries
* Prisma models
* TypeScript types
* Validation
* Auth checks
* Permission checks
* React components
* Forms
* Tables
* Dashboards
* Detail pages
* Upload components
* Download components

Do not assume the current architecture.

---

# 2. COMPLETE API → DATABASE → FRONTEND AUDIT

Audit every existing manuscript/review/revision/publication endpoint.

For every endpoint determine:

1. HTTP method
2. Path
3. Authentication
4. Role
5. Permission
6. Request body
7. Query parameters
8. Validation
9. Response structure
10. Database operation
11. Frontend consumer
12. Whether the frontend actually receives the data
13. Whether it renders correctly
14. Loading state
15. Empty state
16. Error state
17. Authorization behavior

Map:

API
↓
Backend
↓
Database
↓
Frontend

Fix API/frontend mismatches.

Do not create duplicate APIs.

If an existing API can be extended, extend it.

---

# 3. NO MOCK DATA

All new workflow functionality must use actual:

* Database data
* API responses
* Authentication
* User accounts
* Manuscripts
* Reviews
* Revisions
* Files
* Publications

Do not use mock/static manuscript data.

---

# 4. COMPLETE MANUSCRIPT LIFECYCLE

Preserve existing status names where possible.

The workflow should conceptually support:

DRAFT
↓
SUBMITTED
↓
UNDER_REVIEW
↓
EDITOR_REVIEW
↓
REVISION_REQUESTED
↓
REVISION_SUBMITTED_TO_EDITOR
↓
EDITOR_REVISION_REVIEW
↓
OPTIONAL_REVIEWER_REASSIGNMENT
↓
SECOND_REVIEW_ROUND
↓
EDITOR_DECISION
↓
ACCEPTED
↓
PRE_PUBLICATION
↓
FINAL_FILES_REQUESTED
↓
FINAL_FILES_RECEIVED
↓
DOI_ASSIGNED
↓
PUBLISHED

Also preserve:

REJECTED

and any other existing valid statuses.

Do not unnecessarily rename the existing status system.

---

# 5. INITIAL AUTHOR SUBMISSION

The author should be able to submit:

* Title
* Abstract
* Authors
* Affiliations
* Manuscript
* Cover letter
* Source files where applicable

The original submission must be permanently preserved.

---

# 6. EDITOR RECEIVES INITIAL SUBMISSION

After submission:

AUTHOR
↓
EDITOR

The Editor should see:

* Manuscript
* Abstract
* Authors
* Affiliations
* Cover letter
* Uploaded files
* Submission metadata

The Editor can then assign one or more reviewers.

---

# 7. REVIEWER ASSIGNMENT

The Editor assigns reviewers.

Example:

Manuscript:
JEDSD-2026-001

Round 1:

Reviewer 1 → Assigned
Reviewer 2 → Assigned

Each assignment must store:

* Manuscript
* Review round
* Reviewer
* Assignment date
* Deadline
* Review status

---

# 8. REVIEWER DASHBOARD

Reviewers should see only manuscripts assigned to them.

Example:

Assigned Reviews

JEDSD-2026-001
Round 1

Status:
Review Pending

[Open Manuscript]

The reviewer should NOT receive:

* Author's private cover letter unless journal policy allows
* Internal editor notes
* Confidential editorial information
* Files not intended for reviewer

Follow the existing blind-review policy.

---

# 9. REVIEWER SUBMITS REVIEW

Reviewer can:

* Read permitted manuscript files
* Submit reviewer comments
* Submit recommendation
* Submit comments to author
* Submit confidential comments to editor where supported

Reviewer submission must be stored permanently.

The review must be linked to:

* Manuscript
* Review round
* Reviewer
* Reviewer assignment
* Timestamp

---

# 10. REVIEWER SUBMISSION → EDITOR

When reviewer submits:

REVIEWER
↓
REVIEW SUBMITTED
↓
EDITOR

The reviewer does NOT make the final decision.

Reviewer cannot:

* Accept
* Reject
* Request revision
* Publish
* Assign DOI

Reviewer only submits review/recommendation.

---

# 11. ONE REVIEWER SUBMITS FIRST

If there are multiple reviewers:

Reviewer 1 → Submitted
Reviewer 2 → Pending

The Editor must immediately see:

1 of 2 reviews submitted

Reviewer 1:
✓ Submitted

Reviewer 2:
○ Pending

The submitted review must be available to the Editor.

Do not hide it until all reviewers submit.

---

# 12. EDITOR REVIEW PAGE

The Editor should have a clear editorial review page.

Display:

## Manuscript

* ID
* Title
* Authors
* Affiliations
* Abstract
* Submission date
* Review round
* Current status

## Reviewer Progress

Example:

Reviewer 1
✓ Submitted

Reviewer 2
✓ Submitted

Reviewer 3
○ Pending

Show:

2 of 3 reviews submitted

---

# 13. EDITOR SEES REVIEWER COMMENTS

For every submitted review, Editor can see:

* Recommendation
* Comments to author
* Confidential comments to editor
* Submission date
* Review status

Reviewer identity must follow the journal's existing blind-review policy.

---

# 14. REVIEWER RECOMMENDATION VS EDITOR DECISION

Keep these separate.

Example:

Reviewer recommendation:

MAJOR_REVISION

Editor decision:

REVISION_REQUESTED

Another:

Reviewer recommendation:

ACCEPT

Editor decision:

REVISION_REQUESTED

Reviewers recommend.

Editor decides.

---

# 15. EDITOR DECISION

Editor may perform actions supported by the existing workflow:

* Accept
* Request Revision
* Reject
* Send for another review

Do not automatically convert reviewer recommendation into final decision.

---

# 16. REVISION REQUEST

If Editor requests revision:

EDITOR
↓
REVISION REQUESTED
↓
AUTHOR

The author should see:

* Manuscript title
* Manuscript ID
* Review round
* Reviewer comments intended for author
* Editor comments
* Revision requirements
* Previous submission
* Revision deadline if supported

---

# 17. CRITICAL UPDATED REVISION WORKFLOW

This is the most important requirement.

When the author modifies the manuscript based on reviewer/editor comments, the author submits the revised files.

However:

**THE UPDATED FILES MUST GO ONLY TO THE EDITOR FIRST.**

The author must submit:

### Revised Manuscript

Supported:

* PDF
* DOC
* DOCX

### Source Package

Supported:

* ZIP containing LaTeX/source files

### Cover Letter

The cover letter must be submitted with the revision and must be visible to the Editor.

### Response to Reviewers

If the existing workflow supports it, also allow:

* Response to reviewers
* Revision notes

The submission goes:

AUTHOR
↓
EDITOR

NOT:

AUTHOR
↓
REVIEWER

---

# 18. REVISED FILES MUST NOT AUTOMATICALLY GO TO REVIEWERS

When Revision 1 is submitted:

Do NOT automatically send:

* Revised manuscript
* LaTeX ZIP
* Source files
* Cover letter
* Author response

to reviewers.

The Editor receives them first.

The Editor decides whether another review is required.

This is mandatory.

---

# 19. EDITOR REVISION INBOX

The Editor dashboard must clearly show:

## Revisions Submitted

JEDSD-2026-001
Revision 1
Submitted by Author
22 September 2026

Status:

Awaiting Editorial Review

[Review Revision]

---

# 20. EDITOR REVISION DETAIL PAGE

The Editor should open:

Revision Submitted
↓
Revision Detail

The page must show:

## Manuscript

* Manuscript ID
* Title
* Authors
* Affiliations
* Current status
* Revision number
* Submission date

## Previous Review Round

Show the reviewer comments that caused the revision request.

## Author Response

Show:

* Response to reviewers
* Revision notes
* Cover letter

## Updated Files

Show:

* Revised manuscript PDF
* Revised DOC/DOCX
* LaTeX source ZIP
* Other permitted files

Each file must show:

* Filename
* File type
* File size
* Uploaded date
* Uploaded by
* Revision number
* Download action

---

# 21. COVER LETTER MUST GO ONLY TO EDITOR

The cover letter for a revision is editorial material.

The author uploads it during revision submission.

The Editor can see/download it.

Normal reviewers must NOT automatically receive the cover letter.

Only provide reviewer access if the Editor explicitly chooses to share it according to the journal's workflow.

Backend access control must enforce this.

---

# 22. SOURCE ZIP MUST GO ONLY TO EDITOR FIRST

The LaTeX/source ZIP uploaded during revision must initially be accessible only to:

* Author
* Editor
* Authorized editorial users/Admin according to existing permissions

Reviewers should not automatically receive the source ZIP.

The Editor may decide whether reviewers need access.

---

# 23. EDITOR DECIDES WHETHER TO REASSIGN REVIEWERS

After receiving the revision, the Editor must have an explicit action such as:

[Accept Revision]

[Request Further Revision]

[Send for Review]

[Reassign Reviewers]

or an equivalent existing UI.

The Editor decides whether another review round is necessary.

There must NOT be an automatic rule that every revision is sent back to reviewers.

---

# 24. OPTIONAL SECOND REVIEW ROUND

If the Editor chooses to send the revision for another review:

EDITOR
↓
Select reviewers
↓
REVIEW ROUND 2
↓
Selected reviewers receive the appropriate review files
↓
Reviewers submit reviews
↓
EDITOR REVIEW
↓
Editor makes decision

Only the files the Editor intends to provide should be accessible to the reviewer.

The revision's:

* Cover letter
* Source ZIP
* Confidential editorial information

must remain protected unless explicitly shared.

---

# 25. REVIEW ROUND 2

Create a new review round rather than overwriting Round 1.

Example:

Round 1:

Reviewer 1 → Submitted
Reviewer 2 → Submitted

Editor → Revision Requested

Revision 1:

Author → Submitted to Editor

Editor → Send for Review

Round 2:

Reviewer 1 → Assigned
Reviewer 2 → Assigned

or different reviewers:

Reviewer 3 → Assigned
Reviewer 4 → Assigned

The system must preserve all rounds.

---

# 26. REVISION HISTORY

The Editor must have a complete timeline:

## Revision History

Revision 0
Original Submission
↓
Review Round 1
↓
Revision Requested
↓
Revision 1
Submitted by Author
↓
Editor Reviewed Revision
↓
Review Round 2
(optional)
↓
Revision 2
(optional)
↓
Accepted

Each revision should display:

* Revision number
* Date
* Author
* Status
* Files
* Cover letter
* Response
* Related review round
* Editor decision

---

# 27. NEVER OVERWRITE FILES

Original submission:

Revision 0

must remain untouched.

Revision 1 must create new file records.

Revision 2 must create new file records.

Example:

Revision 0

* original.pdf
* original-cover-letter.pdf
* original-source.zip

Revision 1

* revised.pdf
* revised-cover-letter.pdf
* revised-source.zip
* response-to-reviewers.pdf

Revision 2

* revised2.pdf
* revised2-cover-letter.pdf
* revised2-source.zip

Never replace old files.

---

# 28. WORD DOCUMENT SUPPORT

Support:

* .doc
* .docx

The manuscript upload interface should clearly distinguish:

### Manuscript

PDF / DOC / DOCX

### Source Package

ZIP

### Cover Letter

Supported format according to existing file system.

Perform server-side validation.

Do not trust only file extensions from the browser.

---

# 29. LATEX SOURCE ZIP

The ZIP should support LaTeX source such as:

main.tex
references.bib
figures/
tables/
sections/
bibliography/

Possible file types:

* .tex
* .bib
* .bst
* .sty
* .cls
* images
* supplementary source files

Do not require a specific directory structure unless JEDSD already specifies one.

---

# 30. ZIP SECURITY

Treat uploaded ZIP files as untrusted.

Protect against:

* Zip bombs
* Path traversal
* Executables
* Malicious files
* Excessive extraction
* Arbitrary filesystem access

If extraction is not necessary, store the ZIP directly.

If extraction is required:

* Use isolated temporary storage
* Validate paths
* Enforce limits
* Never execute extracted files

---

# 31. EDITOR REVISION ACTIONS

After inspecting the revision, the Editor can choose:

### Option A — Accept

Revision is satisfactory.

Continue:

ACCEPTED
↓
PRE-PUBLICATION

### Option B — Request Further Revision

Author must revise again.

EDITOR
↓
REVISION REQUESTED
↓
AUTHOR
↓
NEW REVISION
↓
EDITOR

### Option C — Send to Reviewers

Editor selects reviewers.

EDITOR
↓
REVIEW ROUND
↓
REVIEWERS
↓
EDITOR

### Option D — Reject

Revision is rejected.

Use existing JEDSD rejection workflow.

---

# 32. PRE-PUBLICATION

After Editor accepts:

Status:

ACCEPTED

The public pre-publication page should display:

* Title
* Abstract
* Authors
* Affiliations
* Journal information
* Publication identifier where applicable

Do NOT expose:

* Reviewer identity
* Confidential reviewer comments
* Confidential editor notes
* Cover letter
* Source ZIP
* Internal files

---

# 33. FINAL FILE WORKFLOW

After acceptance:

ACCEPTED
↓
FINAL FILES REQUESTED
↓
AUTHOR

The author can upload required final publication files according to the existing workflow.

However, final publication remains restricted.

---

# 34. DOI RESTRICTION

The author must NOT be able to:

* Assign DOI
* Modify DOI
* Publish
* Upload DOI-associated final publication files
* Trigger final publication

Backend must enforce this.

---

# 35. PUBLICATION ACCESS MUST NOT BE GIVEN TO ALL EDITORS

Do NOT implement:

role === EDITOR → publish

Instead use a dedicated permission such as:

CAN_PUBLISH

or:

PUBLICATION_EDITOR

Only:

* Admin
* Explicitly authorized Publication Editor

can publish.

---

# 36. AUTHORIZED PUBLICATION EDITOR

Use the existing permission architecture if available.

The publication editor should be explicitly identified through:

* Database permission
* Existing RBAC
* Server-side configuration

Do not hard-code an email into frontend code.

Normal editors retain editorial privileges but do not receive publication privileges automatically.

---

# 37. FINAL DOI/PUBLICATION WORKFLOW

ACCEPTED
↓
PRE-PUBLICATION
↓
FINAL FILES REQUESTED
↓
AUTHOR
↓
FINAL FILES RECEIVED
↓
ADMIN / AUTHORIZED PUBLICATION EDITOR
↓
Review final files
↓
Upload DOI-associated final files
↓
Assign DOI
↓
Publish
↓
PUBLIC ARTICLE

---

# 38. PUBLICATION API SECURITY

Every publication API must check:

* Authentication
* Role
* Explicit permission
* Manuscript state
* Required files
* DOI requirements

For example:

POST /api/publications/[id]/publish

must reject:

Author → 403

Reviewer → 403

Normal Editor → 403

and allow:

Publication Editor → allowed

Admin → allowed

---

# 39. DOI API SECURITY

DOI assignment must be restricted to:

* Admin
* Authorized Publication Editor

Normal:

* Author
* Reviewer
* Editor

must not be able to assign/change DOI.

---

# 40. FILE ACCESS CONTROL

File access must depend on the file's purpose and workflow stage.

### Author

Can access own manuscripts/revisions/final uploads.

### Reviewer

Can access only files explicitly provided for the review assignment.

### Editor

Can access:

* Manuscript
* Reviews
* Revisions
* Cover letters
* Source ZIP
* Editorial files

### Publication Editor/Admin

Can access final publication files.

### Public

Can access only files marked public/published.

---

# 41. REVIEWER MUST NOT AUTOMATICALLY RECEIVE REVISION SOURCE FILES

This is a critical rule.

When the author uploads:

* Revised manuscript
* Source ZIP
* Cover letter
* Response to reviewers

the default access is:

AUTHOR + EDITOR

NOT:

AUTHOR + EDITOR + REVIEWER

Only after the Editor explicitly sends the revision for another review should the appropriate reviewer receive the files required for that review.

---

# 42. EDITOR CAN EXPLICITLY SEND REVISION FOR REVIEW

The Editor should be able to choose:

[Send Revision to Review]

Then:

1. Select review round
2. Select reviewer(s)
3. Determine which files are visible to reviewers
4. Create reviewer assignments
5. Notify reviewers

The system should preserve which reviewers were assigned to which revision/review round.

---

# 43. REVIEWER FILE VISIBILITY

When the Editor sends Revision 1 for another review, reviewers should see the revised manuscript and only those additional files the Editor has intentionally made available.

The system should NOT automatically expose:

* Cover letter
* Confidential editor comments
* Internal audit history
* DOI information
* Publication information
* Private source files

unless explicitly permitted.

---

# 44. NOTIFICATIONS

Use the existing notification/email infrastructure.

Important events:

Reviewer assigned
→ Reviewer notified

Reviewer submits
→ Editor notified

Editor requests revision
→ Author notified

Author submits revision
→ Editor notified

Editor sends revision for another review
→ Selected reviewer(s) notified

Editor accepts
→ Author notified

Final files requested
→ Author notified

Final files submitted
→ Publication Editor/Admin notified

Publication completed
→ Author notified

Do not create a duplicate notification system.

---

# 45. AUDIT TRAIL

Record:

AUTHOR_SUBMITTED_MANUSCRIPT

EDITOR_ASSIGNED_REVIEWER

REVIEWER_SUBMITTED_REVIEW

EDITOR_VIEWED_REVIEW

EDITOR_REQUESTED_REVISION

AUTHOR_SUBMITTED_REVISION

EDITOR_VIEWED_REVISION

EDITOR_SENT_REVISION_FOR_REVIEW

EDITOR_ASSIGNED_SECOND_REVIEW_ROUND

EDITOR_ACCEPTED_REVISION

EDITOR_REQUESTED_FURTHER_REVISION

EDITOR_REQUESTED_FINAL_FILES

AUTHOR_SUBMITTED_FINAL_FILES

AUTHORIZED_EDITOR_ASSIGNED_DOI

AUTHORIZED_EDITOR_UPLOADED_FINAL_FILES

ADMIN_PUBLISHED_MANUSCRIPT

Store where appropriate:

* User
* Role
* Manuscript
* Review round
* Revision
* Action
* Timestamp
* Metadata

Do not expose confidential audit data publicly.

---

# 46. DATABASE DESIGN

First inspect the existing Prisma schema.

Do not blindly add every possible model.

Extend existing structures where appropriate.

Conceptually, the application may require:

Manuscript
ManuscriptRevision
ManuscriptFile
ReviewRound
ReviewerAssignment
Review
Publication
PublicationPermission

But only create models that are actually necessary.

Important relationships:

Manuscript
→ Revisions
→ Review Rounds
→ Reviewer Assignments
→ Reviews
→ Files
→ Publication

A revision must be linked to its relevant review round and files.

A review must be linked to its reviewer assignment and review round.

---

# 47. DATABASE VERSIONING

Never overwrite:

* Previous reviews
* Previous revisions
* Previous files
* Previous decisions

Use immutable historical records wherever possible.

Use constraints and transactions for important workflow operations.

---

# 48. STATUS TRANSITIONS

Do not allow arbitrary status updates.

Implement controlled transitions.

Conceptually:

SUBMITTED
→ UNDER_REVIEW

UNDER_REVIEW
→ EDITOR_REVIEW

EDITOR_REVIEW
→ REVISION_REQUESTED

EDITOR_REVIEW
→ ACCEPTED

EDITOR_REVIEW
→ REJECTED

REVISION_REQUESTED
→ REVISION_SUBMITTED_TO_EDITOR

REVISION_SUBMITTED_TO_EDITOR
→ EDITOR_REVISION_REVIEW

EDITOR_REVISION_REVIEW
→ ACCEPTED

EDITOR_REVISION_REVIEW
→ REVISION_REQUESTED

EDITOR_REVISION_REVIEW
→ SECOND_REVIEW_ROUND

SECOND_REVIEW_ROUND
→ EDITOR_REVIEW

ACCEPTED
→ FINAL_FILES_REQUESTED

FINAL_FILES_REQUESTED
→ FINAL_FILES_RECEIVED

FINAL_FILES_RECEIVED
→ PUBLISHED

Use the existing status architecture where possible.

---

# 49. ROLE/PERMISSION MATRIX

Maintain a permission model equivalent to:

| Action                            | Author |          Reviewer | Editor | Publication Editor |    Admin |
| --------------------------------- | -----: | ----------------: | -----: | -----------------: | -------: |
| Submit manuscript                 |      ✓ |                 — |      — |                  — | Existing |
| View own manuscript               |      ✓ |                 — |      ✓ |                  ✓ |        ✓ |
| Submit review                     |      — |                 ✓ |      — |                  — | Existing |
| Assign reviewers                  |      — |                 — |      ✓ |                  ✓ |        ✓ |
| View reviews                      |      — | Own/assigned only |      ✓ |                  ✓ |        ✓ |
| Request revision                  |      — |                 — |      ✓ |                  ✓ |        ✓ |
| Submit revision                   |      ✓ |                 — |      — |                  — | Existing |
| View revision submitted to editor |  ✓ own |      ✗ by default |      ✓ |                  ✓ |        ✓ |
| Send revision for review          |      — |                 — |      ✓ |                  ✓ |        ✓ |
| Accept/reject                     |      — |                 — |      ✓ |                  ✓ |        ✓ |
| Assign DOI                        |      ✗ |                 ✗ |      ✗ |                  ✓ |        ✓ |
| Upload DOI final files            |      ✗ |                 ✗ |      ✗ |                  ✓ |        ✓ |
| Publish                           |      ✗ |                 ✗ |      ✗ |                  ✓ |        ✓ |

Adapt to existing JEDSD roles while preserving the publication restriction.

---

# 50. AUTHOR JOURNEY

The Author flow should be:

Author Dashboard
↓
Manuscript
↓
Revision Requested
↓
View Reviewer Comments
↓
Modify Manuscript
↓
Submit Revision
↓
Upload Revised Manuscript
↓
Upload LaTeX ZIP
↓
Upload Cover Letter
↓
Upload Response to Reviewers
↓
Submit
↓
Revision Submitted to Editor
↓
Wait for Editorial Decision

The author must clearly see:

"Your revised files have been submitted to the Editor."

The author must NOT see a state suggesting that the revision has automatically gone to reviewers.

---

# 51. EDITOR JOURNEY

The Editor flow should be:

Editor Dashboard
↓
Manuscripts
↓
Revision Submitted
↓
Open Revision
↓
View Previous Reviews
↓
View Author Response
↓
View Cover Letter
↓
Download Revised Manuscript
↓
Download LaTeX ZIP
↓
Evaluate Revision
↓
Choose:

Accept
OR
Request Further Revision
OR
Send for Review
OR
Reject

This is the core workflow.

---

# 52. REVIEWER JOURNEY

Reviewer:

Reviewer Dashboard
↓
Assigned Manuscript
↓
Open Manuscript
↓
Read permitted files
↓
Submit Review
↓
Review Submitted

For a second review round:

Reviewer
↓
New Review Assignment
↓
Revision Manuscript
↓
Submit New Review

Previous reviews must remain preserved.

---

# 53. COMPLETE REAL-WORLD SCENARIO

Test exactly this scenario:

### STEP 1

Author submits Paper A.

### STEP 2

Editor receives Paper A.

### STEP 3

Editor assigns Reviewer 1 and Reviewer 2.

### STEP 4

Reviewer 1 submits review.

Expected:

Editor sees:

1 of 2 reviews submitted.

### STEP 5

Reviewer 2 submits review.

Expected:

Editor sees:

2 of 2 reviews submitted.

### STEP 6

Editor reviews both.

### STEP 7

Editor requests revision.

### STEP 8

Author sees reviewer comments.

### STEP 9

Author modifies paper.

### STEP 10

Author uploads:

* Revised PDF
* LaTeX source ZIP
* Cover letter
* Response to reviewers
* DOC/DOCX if applicable

### STEP 11

Author submits Revision 1.

Expected:

Revision goes ONLY to Editor.

NOT to reviewers.

### STEP 12

Editor dashboard shows:

Revision Submitted

### STEP 13

Editor opens Revision 1.

Editor can see:

* Previous reviewer comments
* Author response
* Cover letter
* Revised PDF
* LaTeX ZIP
* DOC/DOCX
* Revision history

### STEP 14

Editor decides:

"Send for Review"

### STEP 15

Editor selects Reviewer 1 and/or Reviewer 2 or new reviewers.

### STEP 16

Only selected reviewers receive the revision files required for review.

### STEP 17

Reviewers submit Round 2 reviews.

### STEP 18

Editor reviews Round 2.

### STEP 19

Editor accepts.

### STEP 20

Abstract + authors + affiliations appear on pre-publication page.

### STEP 21

Final files are requested.

### STEP 22

Author submits final required files.

### STEP 23

Normal editor attempts publication.

Expected:

403 Forbidden.

### STEP 24

Authorized Publication Editor attempts publication.

Expected:

Allowed.

### STEP 25

Admin attempts publication.

Expected:

Allowed.

### STEP 26

Authorized user assigns DOI.

### STEP 27

Authorized user uploads final DOI-associated files.

### STEP 28

Article is published.

### STEP 29

Public page displays:

* Title
* Authors
* Affiliations
* Abstract
* Final article
* DOI
* Publication information

---

# 54. API TESTING

Test all relevant APIs independently from the frontend.

Verify:

200
Success

201
Created

400
Validation

401
Unauthenticated

403
Unauthorized

404
Not Found

409
Invalid State Transition

413
File Too Large

422
Invalid File/Data

500
Unexpected Error

Especially test:

* Reviewer submission
* Editor review
* Revision submission
* Revision file upload
* Cover letter upload
* Source ZIP upload
* Reviewer reassignment
* Second review round
* DOI assignment
* Publication

---

# 55. FRONTEND NETWORK VERIFICATION

For every affected page:

Open browser.

Inspect Network requests.

Verify:

Frontend
↓
Correct API endpoint
↓
Correct authentication
↓
Correct database response
↓
Correct UI rendering

Verify real values for:

* Manuscript ID
* Status
* Reviewer count
* Submitted reviews
* Revision number
* Files
* Cover letter
* Author response
* Editor decision
* DOI
* Publication status

No mock data.

---

# 56. FILE SECURITY TESTING

Test:

* Author can upload own revision
* Author cannot upload to another manuscript
* Reviewer cannot upload a revision
* Reviewer cannot access cover letter unless explicitly authorized
* Reviewer cannot access source ZIP unless explicitly shared
* Editor can access revision files
* Unauthorized users cannot download private files
* Unsupported extensions are rejected
* Oversized files are rejected
* Malicious ZIP paths are rejected

---

# 57. FINAL SECURITY TEST

Explicitly test:

Author → Cannot publish

Reviewer → Cannot publish

Reviewer → Cannot submit another reviewer's review

Reviewer → Cannot access revision source ZIP by default

Reviewer → Cannot access revision cover letter by default

Normal Editor → Cannot publish

Normal Editor → Cannot assign DOI

Normal Editor → Can inspect revisions

Normal Editor → Can choose whether to send revision for review

Publication Editor → Can publish

Admin → Can publish

Public → Can only access public/published content

---

# 58. FINAL CODEBASE AUDIT

After implementation search again for:

* TODO
* FIXME
* mock
* dummy
* hardcoded
* console.log
* fake data
* placeholder DOI
* fake file URLs
* duplicate API
* stale API
* unused component
* old status
* broken import
* TypeScript errors

Run:

* lint
* typecheck
* build
* tests

Fix all issues introduced by the implementation.

Do not rewrite unrelated functionality.

---

# 59. FINAL IMPLEMENTATION REPORT

After completing the implementation, provide:

## Existing Architecture

* Framework
* Database
* Authentication
* Authorization
* File storage
* Existing workflow

## API Audit

For each affected endpoint:

METHOD
PATH
AUTH
ROLE/PERMISSION
PURPOSE
DATABASE
FRONTEND CONSUMER
STATUS

Mark:

* Existing and working
* Existing and fixed
* Extended
* Newly created

## Database Changes

List:

* Models added
* Models modified
* Relations
* Statuses
* Constraints

## Frontend Changes

### Author

...

### Reviewer

...

### Editor

...

### Publication Editor

...

### Admin

...

### Public

...

## File Workflow

Explain:

PDF
DOC
DOCX
ZIP
LaTeX
Cover Letter

and who can access each file at each stage.

## Review Workflow

Explain:

Round 1
Round 2
Reviewer submission
Editor review
Revision

## Publication Workflow

Explain:

Acceptance
Pre-publication
Final files
DOI
Publication

## Security

Explain all role/permission restrictions.

## Testing

Report:

* Lint
* Typecheck
* Build
* API tests
* Frontend tests
* Upload tests
* Reviewer tests
* Revision tests
* Second-review tests
* Permission tests
* Publication tests

---

# 60. ABSOLUTE RULES

1. Audit the existing project before coding.

2. Do not assume the existing architecture.

3. Reuse existing APIs/models/components where possible.

4. Do not create duplicate APIs unnecessarily.

5. Do not use mock data.

6. Reviewer submissions go to the Editor.

7. Reviewer recommendations do not equal Editor decisions.

8. If one reviewer submits, Editor can see that review immediately.

9. Multiple review rounds must be supported.

10. Previous reviews must never be overwritten.

11. Author revisions must never overwrite previous files.

12. Revised files initially go ONLY to the Editor.

13. Revised LaTeX/source ZIP initially goes ONLY to the Editor.

14. Revision cover letter initially goes ONLY to the Editor.

15. Author response initially goes ONLY to the Editor.

16. Reviewers must NOT automatically receive revised files.

17. Editor decides whether to send the revision for another review.

18. Editor can select/reassign reviewers for a new review round.

19. Only explicitly selected reviewers receive revision files for the new review round.

20. Cover letter must remain Editor-only unless explicitly shared.

21. Source ZIP must remain Editor-only unless explicitly shared for review.

22. Backend authorization must enforce all file access.

23. Authors cannot publish.

24. Reviewers cannot publish.

25. Normal Editors cannot publish.

26. Only Admin or explicitly authorized Publication Editor can publish.

27. Only authorized users can assign DOI.

28. Frontend button hiding is NOT security.

29. Every important action must be audited.

30. Every API must be connected correctly to its frontend consumer.

31. Every frontend API dependency must be verified against the backend.

32. No stale API contracts.

33. No broken API/frontend data flow.

34. No duplicate workflow.

35. Do not break existing JEDSD functionality.

36. Keep the existing JEDSD design system.

37. The final implementation must be production-ready.

The core editorial principle is:

**AUTHOR SUBMITS REVISION → EDITOR RECEIVES IT → EDITOR EVALUATES IT → EDITOR DECIDES WHETHER TO SEND IT TO REVIEWERS AGAIN.**

Never automatically send revised files, source ZIP, or cover letter to reviewers.
