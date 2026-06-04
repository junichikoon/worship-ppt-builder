# Worship PPT Builder - PRD Draft

Document Type:
- AI-friendly PRD.

Product:
- Church worship PPT generation SaaS.

Current Basis:
- Existing prototype: https://junichikoon.github.io/worship-ppt-builder/
- This PRD describes the current MVP direction based on the prototype.
- Do not treat this as a greenfield product spec.

---

## 1. Goal

Goal:
- Help pastors and worship staff create worship PPT files faster.

Current Pain:
- Manual PPT creation takes 2-3 hours.

Target Outcome:
- User can create a worship PPT in under 10 minutes.

Primary User:
- Pastor
- Worship staff
- Church media team member

---

## 2. MVP Scope

In Scope:
- Module-based PPT creation.
- Praise module.
- Hymn module.
- Bible module.
- Sermon module.
- Announcement module.
- Custom module.
- Module add/duplicate/delete/reorder.
- Slide preview.
- Module-grouped thumbnails.
- Template save/load using localStorage.
- Recommended template dummy data.
- Dummy login.
- PPTX generation in browser.
- Share dummy modal.
- Global settings:
  - Aspect ratio
  - Logo ON/OFF
  - Logo upload/change/delete
  - Logo position

Out of Scope For Current Prototype:
- Real backend auth.
- Real organization/workspace.
- Real database.
- Real Bible API.
- Real praise/hymn DB.
- Real share permission.
- Payment.
- Landing page.
- Admin dashboard.
- Multi-user collaboration.

---

## 3. Success Criteria

Functional Success:
- User can compose worship PPT from modules.
- User can preview generated slides.
- User can export PPTX.
- User can save and reload templates locally.
- User can change global aspect ratio and logo.

UX Success:
- User can understand slide order from module order.
- User can identify which slides belong to which module.
- User can complete basic PPT generation without editing individual slides.

Technical Success:
- Preview, thumbnails, and PPTX output stay consistent.
- State persists after browser refresh.
- Invalid Bible range blocks PPT generation.
- Existing functionality is preserved during incremental changes.

---

## 4. Core User Stories

User Story: Create Worship PPT
- As a worship staff member,
- I want to add worship content modules,
- So that I can generate a full worship PPT quickly.

Acceptance Criteria:
- User can add modules.
- User can edit module content.
- User can reorder modules.
- User can preview slides.
- User can generate PPTX.

User Story: Save Template
- As a worship staff member,
- I want to save my module order and settings,
- So that I can reuse the same worship format.

Acceptance Criteria:
- User clicks Template Save.
- If logged out, user is moved to LoginView.
- After login, save flow continues.
- Duplicate template names append `(1)`, `(2)`.
- Existing saved template can be overwritten after confirmation.

User Story: Load Template
- As a worship staff member,
- I want to load saved or recommended templates,
- So that I can start from an existing worship package.

Acceptance Criteria:
- Saved templates appear in Templates tab.
- Recommended templates appear in Templates tab.
- Clicking a template loads module order and all settings.
- If current work differs from initial/default state, ask whether to save first.

User Story: Generate PPT
- As a worship staff member,
- I want to export my worship document as PPTX,
- So that I can use it during service.

Acceptance Criteria:
- Generate action requires login.
- Bible modules are validated.
- Invalid Bible range blocks export.
- Valid state downloads `.pptx`.
- PPTX reflects preview, thumbnails, aspect ratio, and logo.

---

## 5. Feature Requirements

### Feature: Builder

Inputs:
- Module type.
- Module content.
- Module style.
- Module order.

Actions:
- Add module.
- Duplicate module.
- Delete module.
- Reorder module.
- Collapse/expand module.

Outputs:
- Slide list.
- Preview.
- Thumbnails.

Acceptance Criteria:
- Each module action updates preview and thumbnails.
- Drag-and-drop reorder updates slide order.
- Duplicate preserves module content and settings.

### Feature: Template

Inputs:
- Template name.
- Current modules.
- Presentation settings.

Actions:
- Save template.
- Rename saved template.
- Delete saved template.
- Load saved template.
- Load recommended template.

Outputs:
- Template record.
- Restored editor state.

Acceptance Criteria:
- Template snapshot includes all modules and settings.
- Template load restores preview, thumbnails, and PPT generation output.

### Feature: Settings

Inputs:
- Aspect ratio.
- Logo enabled.
- Logo image.
- Logo position.

Actions:
- Select 16:9 or 4:3.
- Turn logo ON/OFF.
- Upload logo.
- Change logo.
- Delete logo.
- Select logo corner.

Outputs:
- Updated global presentation settings.

Acceptance Criteria:
- Aspect ratio updates preview, thumbnails, and PPTX.
- Logo appears only when ON.
- Logo is semi-transparent.
- Logo appears below slide content.

---

## 6. Data Requirements

Current Data:
- Dummy praise list.
- Dummy hymn list.
- Dummy Bible data.
- Dummy recommended templates.
- Dummy auth.
- Dummy share link.

Storage:
- localStorage only.

Future Data:
- Users.
- Organizations.
- Memberships.
- Templates.
- Worship documents.
- Songs.
- Hymns.
- Bible passages.
- Uploaded assets.
- Share links.

---

## 7. Non-Functional Requirements

Performance:
- Editing module input should not cause noticeable lag.
- Announcement module with 5+ items should remain usable.
- Preview and thumbnails should update quickly.

Responsiveness:
- Preview must not overflow its frame.
- Thumbnails must stay inside group frames.
- Module panel must avoid horizontal scroll.

Reliability:
- localStorage parse errors should fallback safely.
- Missing dummy data should not crash rendering.

Maintainability:
- Keep feature changes scoped.
- Update preview, thumbnail, and PPTX paths together.
- Avoid visual changes unless requested.

---

## 8. Release Boundaries

Prototype Release:
- Static frontend.
- localStorage persistence.
- Dummy data.
- Browser PPTX generation.

MVP Backend Release:
- Real auth.
- User/organization model.
- Persisted templates.
- Persisted worship documents.
- Real content APIs or DB.

Post-MVP:
- RBAC.
- Real sharing.
- Payment.
- Advanced template management.
- Server-side rendering.
- Collaboration.

---

## 9. Open Decisions

Decision: User / Organization structure
- Needed before backend schema.

Decision: Template ownership
- Personal template vs organization template.

Decision: Worship document lifecycle
- Temporary draft vs saved document vs exported history.

Decision: Content licensing
- Praise lyrics and Bible translations may require licensing.

Decision: PPT generation location
- Browser-only vs server-side.

---

## 10. Next Documents

1. User Organization Structure
2. Data Ownership
3. RBAC
4. ERD
5. API Specification
6. AI Task Breakdown
