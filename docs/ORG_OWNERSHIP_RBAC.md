# Worship PPT Builder - User, Ownership, RBAC Policy

Document Type:
- AI-friendly architecture decision document.

Purpose:
- Define User / Organization structure.
- Define data ownership policy.
- Define MVP RBAC policy.
- Provide the basis for future ERD.

Source Documents:
- `docs/AI_CONTEXT.md`
- `docs/PRD.md`

Current Product Basis:
- Existing prototype: https://junichikoon.github.io/worship-ppt-builder/
- Current prototype is static frontend.
- Current persistence is localStorage.
- Backend MVP will introduce real auth, organizations, persisted templates, and persisted worship documents.

Design Principles:
- MVP first.
- Avoid over-engineering.
- Support future SaaS expansion.
- Preserve current prototype concepts:
  - User
  - Organization
  - Membership
  - WorshipDocument
  - Template
  - Module
  - Slide
  - PresentationSettings

---

## 1. User / Organization Structure

### Entity: User

Role:
- Authenticated person using the service.
- Can belong to one or more organizations.
- Can create and edit worship PPT content based on membership permissions.

Responsibilities:
- Own login identity.
- Maintain personal profile.
- Access organizations through Membership records.
- Create or edit resources only through organization permissions.

MVP Fields:
- id
- email
- name
- createdAt
- updatedAt
- lastLoginAt

Future Fields:
- avatarUrl
- phone
- locale
- notificationPreferences
- defaultOrganizationId

Lifecycle:
- Created when user signs up or is invited.
- Active after email/social auth is verified.
- Can join organizations through invitation or organization creation.
- Can leave organizations.
- Can be deactivated or deleted later.

MVP Rule:
- A User should not directly own core worship resources by default.
- User access to Template, WorshipDocument, Logo, UploadedAsset, Announcement, and SharedLink should be mediated by Organization Membership.

Reason:
- The product is church/team oriented.
- Worship PPT assets are usually church-owned work products.
- This avoids data loss when a staff member leaves.

---

### Entity: Organization

Role:
- Church or team workspace.
- Primary owner of worship PPT resources.

Responsibilities:
- Own shared worship resources.
- Manage members.
- Manage organization-level templates.
- Manage organization-level presentation settings.
- Manage uploaded assets.

MVP Fields:
- id
- name
- slug
- createdByUserId
- createdAt
- updatedAt
- deletedAt

Future Fields:
- billingStatus
- plan
- defaultPresentationSettingsId
- logoAssetId
- address
- denomination
- timezone

Lifecycle:
- Created by a User.
- Creator receives Owner role.
- Members can be invited.
- Organization can be soft-deleted.
- Organization resources are retained during soft-delete period.

MVP Rule:
- Organization is the default ownership boundary.
- Most resources should have `organizationId`.

Reason:
- Supports one church / many staff.
- Supports one user / multiple churches.
- Prepares for billing and RBAC.

---

### Entity: Membership

Role:
- Link between User and Organization.
- Stores user role inside the organization.

Responsibilities:
- Define access rights.
- Track membership lifecycle.
- Support multi-organization users.

MVP Fields:
- id
- userId
- organizationId
- role
- status
- invitedByUserId
- joinedAt
- createdAt
- updatedAt

Role Values:
- owner
- admin
- editor
- viewer

Status Values:
- invited
- active
- removed

Lifecycle:
- Created when a user creates or is invited to an organization.
- Becomes active after accepting invite or creating organization.
- Can be updated when role changes.
- Can be removed when user leaves or admin removes user.

MVP Rule:
- A User can have multiple Membership records.
- A User can have different roles in different Organizations.
- Resource authorization must check active Membership.

---

## 2. Relationship Definition

Relationship:
- User has many Memberships.
- Organization has many Memberships.
- Membership belongs to one User.
- Membership belongs to one Organization.

Cardinality:
- User `1:N` Membership
- Organization `1:N` Membership
- User `N:M` Organization through Membership

Implementation Rule:
- Do not store only `organizationIds` array on User as the source of truth.
- Use Membership as the source of truth for organization access.

---

### Case 1: One User, One Church

Scenario:
- A pastor signs up and creates one church workspace.

State:
- User: 1 record.
- Organization: 1 record.
- Membership: 1 record.

Membership:
- userId: User.id
- organizationId: Organization.id
- role: owner
- status: active

Expected Behavior:
- User enters organization workspace by default.
- User can create templates, worship documents, upload logo, and generate PPT.

---

### Case 2: One User, Multiple Churches

Scenario:
- A designer or pastor works for multiple churches.

State:
- User: 1 record.
- Organization: multiple records.
- Membership: one record per organization.

Expected Behavior:
- User selects active organization.
- All templates/documents/settings are scoped by selected organization.
- Same user can have different roles per organization.

Example:
- Church A: owner
- Church B: editor
- Church C: viewer

MVP UX:
- Organization switcher can be added later.
- If no switcher exists in first backend MVP, use `defaultOrganizationId`.

---

### Case 3: Leave Church

Scenario:
- User voluntarily leaves an organization.

Policy:
- Set Membership.status = removed.
- Do not delete organization-owned resources.
- Do not delete templates/documents created by the user.

Access Result:
- User loses access to organization resources.
- Organization retains resources.

Transfer Rule:
- If leaving user is the only Owner, leaving should be blocked until another Owner is assigned.

MVP Rule:
- Organization must always have at least one active Owner.

---

### Case 4: Delete Church

Scenario:
- Owner deletes organization.

Policy:
- Soft-delete Organization.
- Set `Organization.deletedAt`.
- Hide organization from normal workspace list.
- Keep resources during retention period.

Resource Handling:
- Templates remain associated with deleted organization.
- WorshipDocuments remain associated with deleted organization.
- UploadedAssets remain associated with deleted organization.
- SharedLinks should become disabled.

MVP Rule:
- Hard-delete is not required in MVP.
- Soft-delete is enough.

Future Rule:
- Add retention policy and hard-delete job.

---

### Case 5: Move Church

Interpretation:
- User moves from one church organization to another.
- This is not a data migration by default.

Policy:
- Remove or deactivate Membership in old organization.
- Create Membership in new organization.
- Old organization resources stay in old organization.
- New organization resources stay in new organization.

Optional Transfer:
- Specific templates or worship documents can be duplicated into the new organization if allowed.
- Duplication should create new resource IDs and new organization ownership.

MVP Rule:
- Do not implement cross-organization transfer in initial backend MVP.
- Implement duplicate-to-organization later if needed.

---

## 3. Data Ownership Policy

Recommended MVP Ownership Model:
- Organization-owned by default.
- User is creator/editor, not primary owner.

Reason:
- Worship PPT work is produced for a church/team.
- Staff changes should not remove church assets.
- RBAC and billing are easier when resources are organization-scoped.

---

### Ownership Options Comparison

#### Option A: Personal Ownership

Definition:
- Resources belong to individual User.

Pros:
- Simple for solo use.
- Easy initial schema.
- No organization required.

Cons:
- Poor fit for church/team workflow.
- Data loss risk when staff leaves.
- Sharing and billing become harder.
- Later migration to organization ownership is painful.

Use Case:
- Personal draft space.

Recommendation:
- Do not use as default MVP model.

---

#### Option B: Church Ownership

Definition:
- Resources belong to Organization.
- Users access through Membership.

Pros:
- Best fit for church SaaS.
- Supports teams.
- Supports staff turnover.
- Supports organization billing.
- Clear RBAC boundary.

Cons:
- Requires Organization and Membership from backend MVP.
- Slightly more setup than personal-only model.

Use Case:
- Main production workspace.

Recommendation:
- Use as MVP default.

---

#### Option C: Personal + Church Shared Ownership

Definition:
- Some resources are personal.
- Some resources are organization-owned.
- User can share or transfer resources.

Pros:
- Flexible.
- Supports private drafts.
- Supports personal template library.

Cons:
- More complex permissions.
- More complex UX.
- Harder ERD.
- Higher over-engineering risk.

Use Case:
- Later advanced SaaS features.

Recommendation:
- Do not implement in MVP.
- Consider after organization-owned model is stable.

---

## 4. Resource Ownership Details

### Resource: Template

Owner:
- Organization.

Access Scope:
- Active organization members.
- Permissions depend on role.

Delete Policy:
- Owner/Admin can delete.
- Editor cannot delete organization templates by default.
- Delete should be soft-delete.

Transfer Policy:
- No transfer in MVP.
- Future: duplicate template to another organization.

MVP Fields:
- id
- organizationId
- createdByUserId
- updatedByUserId
- name
- snapshot
- source
- deletedAt

---

### Resource: WorshipDocument

Owner:
- Organization.

Access Scope:
- Active organization members.
- Editor and above can create/edit.
- Viewer can read only if document sharing within org is enabled.

Delete Policy:
- Owner/Admin can delete.
- Editor can delete only documents they created if MVP wants lightweight creator control.
- Recommended MVP: Owner/Admin delete only.

Transfer Policy:
- No transfer in MVP.
- Future: duplicate document to another organization.

MVP Fields:
- id
- organizationId
- createdByUserId
- updatedByUserId
- name
- modules
- presentationSettings
- deletedAt

---

### Resource: Logo

Owner:
- Organization.

Access Scope:
- Active organization members can view.
- Owner/Admin can change.

Delete Policy:
- Owner/Admin can delete or replace.
- Deleting logo should not delete historical exported PPT files.

Transfer Policy:
- No transfer.
- Future: copied with organization template package if needed.

MVP Fields:
- Store as UploadedAsset.
- Referenced by PresentationSettings.

---

### Resource: Uploaded Asset

Owner:
- Organization.

Access Scope:
- Active organization members can view assets used in documents/templates.
- Editor and above can upload assets.

Delete Policy:
- Owner/Admin can delete.
- Deletion must check whether asset is still referenced.
- MVP safe policy: mark as deleted but keep file if referenced.

Transfer Policy:
- No transfer in MVP.
- Future: duplicate asset to another organization.

MVP Fields:
- id
- organizationId
- uploadedByUserId
- assetType
- fileName
- mimeType
- storageKey
- sizeBytes
- deletedAt

---

### Resource: Announcement

Owner:
- Organization.

Access Scope:
- Active organization members.
- Editor and above can create/edit within worship documents.

Delete Policy:
- If announcement is embedded inside a WorshipDocument module, deletion follows document editing rules.
- If announcements become reusable records later, Owner/Admin can delete shared announcements.

Transfer Policy:
- No transfer in MVP.

MVP Rule:
- Announcement can remain module-embedded JSON in WorshipDocument/Template.
- Do not create standalone Announcement table unless reusable announcements are required.

---

### Resource: Shared Link

Owner:
- Organization.

Access Scope:
- Link recipient access depends on link policy.
- MVP can use dummy share modal only.

Delete Policy:
- Owner/Admin can revoke.
- Creator can revoke own link if allowed.

Transfer Policy:
- No transfer.
- Link belongs to the resource organization.

Future Fields:
- id
- organizationId
- resourceType
- resourceId
- token
- createdByUserId
- permission
- expiresAt
- revokedAt

---

## 5. RBAC

Roles:
- Owner
- Admin
- Editor
- Viewer

Role Definitions:
- Owner:
  - Full organization control.
  - Billing/future ownership authority.
  - Can delete organization.
  - Can manage all members.
- Admin:
  - Operational manager.
  - Can manage members except Owner removal.
  - Can manage templates/settings/assets.
- Editor:
  - Content creator.
  - Can create/edit worship documents and templates.
  - Cannot manage organization-critical settings unless explicitly allowed.
- Viewer:
  - Read-only participant.
  - Can view resources.
  - Can download PPT if allowed by organization policy.

MVP Authorization Rule:
- Check active Membership for every organization-scoped action.
- Deny access if Membership.status is not active.
- Deny access if Organization.deletedAt is not null.

---

## 6. RBAC Permission Table

| Feature | Owner | Admin | Editor | Viewer |
| ------- | ----- | ----- | ------ | ------ |
| View Organization | Yes | Yes | Yes | Yes |
| Update Organization Name | Yes | Yes | No | No |
| Delete Organization | Yes | No | No | No |
| Transfer Organization Ownership | Yes | No | No | No |
| Invite Member | Yes | Yes | No | No |
| Remove Member | Yes | Yes | No | No |
| Remove Owner | Yes | No | No | No |
| Change Member Role | Yes | Yes | No | No |
| View Templates | Yes | Yes | Yes | Yes |
| Create Template | Yes | Yes | Yes | No |
| Modify Template | Yes | Yes | Yes | No |
| Delete Template | Yes | Yes | No | No |
| Rename Template | Yes | Yes | Yes | No |
| Load Template | Yes | Yes | Yes | Yes |
| View WorshipDocument | Yes | Yes | Yes | Yes |
| Create WorshipDocument | Yes | Yes | Yes | No |
| Modify WorshipDocument | Yes | Yes | Yes | No |
| Delete WorshipDocument | Yes | Yes | No | No |
| PPT Generate | Yes | Yes | Yes | No |
| PPT Download | Yes | Yes | Yes | Yes |
| Change Logo | Yes | Yes | No | No |
| Delete Logo | Yes | Yes | No | No |
| Upload Asset | Yes | Yes | Yes | No |
| Delete Asset | Yes | Yes | No | No |
| Change Global Settings | Yes | Yes | No | No |
| Create Shared Link | Yes | Yes | Yes | No |
| Revoke Any Shared Link | Yes | Yes | No | No |
| Revoke Own Shared Link | Yes | Yes | Yes | No |
| View Shared Link | Yes | Yes | Yes | Yes |

MVP Notes:
- Viewer can download PPT but cannot generate new PPT from editable state if generation mutates/export-logs server data.
- If PPT generation is stateless and read-only, Viewer can be allowed to generate. Recommended MVP: keep Generate for Editor+ to avoid ambiguity.
- Editor can modify templates in MVP because templates are part of content workflow.
- Admin/Owner only for global logo and settings because those affect the whole organization.

---

## 7. Architecture Recommendation

### Recommended Structure

Recommendation:
- Organization-first resource ownership.
- Membership-based access control.
- Keep modules and presentation settings as JSON fields in Template and WorshipDocument for MVP.
- Keep Slide as generated output, not persisted as independent DB rows in MVP.
- Store uploaded files as UploadedAsset records.
- Store reusable templates as Template records.

Recommended Backend MVP Entities:
- User
- Organization
- Membership
- Template
- WorshipDocument
- UploadedAsset
- SharedLink

Recommended JSON Fields:
- Template.snapshot
- WorshipDocument.modules
- WorshipDocument.presentationSettings
- Template.presentationSettings or snapshot.presentationSettings

Reason:
- Current prototype already stores modules and settings as one snapshot.
- JSON preserves frontend velocity.
- Avoids premature normalization of every Module/Slide field.
- ERD stays small enough for MVP.

---

### Not Recommended Structure

Not Recommended:
- Personal ownership as default.
- Persisting every generated Slide as a database row in MVP.
- Building separate tables for every module type immediately.
- Implementing personal + organization sharing in first backend version.
- Adding full asset transfer between organizations in MVP.
- Adding complex billing roles before real billing exists.

Reason:
- These add complexity before core workflow is validated.
- Current product value is fast PPT creation, not enterprise workspace administration.

---

### Over-Engineering Risks

Risk: Too many resource ownership modes.
- Avoid personal/shared/org mixed ownership in MVP.

Risk: Over-normalized module schema.
- Avoid separate PraiseModule, BibleModule, SermonModule tables in MVP.
- Use JSON until module schema stabilizes.

Risk: Persisted generated slides.
- Slides are derived from modules.
- Persisting slides creates sync problems.

Risk: Advanced RBAC too early.
- Use four roles only.
- Avoid custom permissions in MVP.

Risk: Cross-organization transfer too early.
- Implement duplicate later.
- Do not implement live ownership transfer in MVP.

---

### Future Extension Points

Future: Personal Workspace
- Add personal organization or workspace type.
- Allow private draft templates.

Future: Template Marketplace
- Add public/recommended template visibility.
- Add template publisher fields.

Future: Real Sharing
- Add SharedLink permissions.
- Add expiration.
- Add public/private link controls.

Future: Content Database
- Add Song, Hymn, BiblePassage, Translation entities.
- Keep selected content references in Module JSON.

Future: Server-side PPT Generation
- Add ExportJob or PptExport entity.
- Store generated PPT files.

Future: Advanced RBAC
- Add custom permission policies if enterprise churches need them.

Future: Audit Log
- Track organization-critical actions:
  - member invited
  - member removed
  - role changed
  - template deleted
  - logo changed
  - organization deleted

---

## 8. ERD Entity List

If ERD is written based on this structure, include these entities.

Required For Backend MVP:
- User
- Organization
- Membership
- Template
- WorshipDocument
- UploadedAsset
- SharedLink

Recommended Supporting Entities:
- PresentationSettings
  - Option A: JSON embedded in Organization/Template/WorshipDocument.
  - Option B: separate table later if settings become reusable/versioned.
- Module
  - Option A: JSON embedded in Template/WorshipDocument for MVP.
  - Option B: separate table later if collaborative editing/versioning requires it.
- Slide
  - Generated/derived object for MVP.
  - Do not persist as required table in MVP.

Future Entities:
- Invitation
- AuditLog
- ExportJob
- PptExport
- Song
- Hymn
- HymnScoreImage
- BibleBook
- BibleChapter
- BibleVerse
- BibleTranslation
- CustomContentPreset
- BillingAccount
- Subscription
- PaymentMethod

ERD MVP Recommendation:
- Start with:
  - User
  - Organization
  - Membership
  - Template
  - WorshipDocument
  - UploadedAsset
  - SharedLink
- Keep Module, Slide, and PresentationSettings as JSON/derived concepts until backend requirements stabilize.
