# Worship PPT Builder - Backend MVP API Specification

Document Type:
- AI-friendly REST API specification.

Source Document:
- `docs/BACKEND_MVP_ERD.md`

API Style:
- REST.
- OpenAPI-inspired structure.
- JSON request/response by default.
- Organization-scoped resource paths.

Backend MVP Tables:
- users
- organizations
- memberships
- templates
- worship_documents
- uploaded_assets

Excluded From This API Spec:
- shared_links
  - Reason: user requested Auth, User, Organization, Membership, Template, WorshipDocument, UploadedAsset.
  - Future API: `/organizations/{organizationId}/shared-links`.

---

## 1. Global API Rules

Base URL:

```text
/api/v1
```

Content Type:

```http
Content-Type: application/json
Accept: application/json
```

Authentication:
- Use Bearer access token.

```http
Authorization: Bearer {accessToken}
```

Organization Scope:
- Organization-owned resources must use organization-scoped paths.
- Path format:

```text
/organizations/{organizationId}/{resource}
```

Authorization Source:
- `memberships`
- Required conditions:
  - `memberships.user_id = currentUser.id`
  - `memberships.organization_id = organizationId`
  - `memberships.status = active`
  - `organizations.deleted_at IS NULL`

Soft Delete:
- Delete endpoints set `deleted_at` or `status = removed`.
- Normal list/get endpoints return only active records.

ID Type:
- UUID string.

Date Type:
- ISO 8601 timestamp.

Example:

```json
"2026-06-04T07:00:00.000Z"
```

---

## 2. Frontend API Implementation Order

Order 1: Auth
- `POST /auth/login`
- `POST /auth/logout`
- `GET /users/me`

Order 2: Organization Bootstrap
- `GET /organizations`
- `POST /organizations`
- `GET /organizations/{organizationId}`

Order 3: Builder Persistence
- `GET /organizations/{organizationId}/templates`
- `POST /organizations/{organizationId}/templates`
- `GET /organizations/{organizationId}/templates/{templateId}`
- `PUT /organizations/{organizationId}/templates/{templateId}`
- `DELETE /organizations/{organizationId}/templates/{templateId}`

Order 4: Worship Document Persistence
- `GET /organizations/{organizationId}/worship-documents`
- `POST /organizations/{organizationId}/worship-documents`
- `GET /organizations/{organizationId}/worship-documents/{documentId}`
- `PUT /organizations/{organizationId}/worship-documents/{documentId}`
- `DELETE /organizations/{organizationId}/worship-documents/{documentId}`

Order 5: Settings / Logo / Uploads
- `GET /organizations/{organizationId}/assets`
- `POST /organizations/{organizationId}/assets`
- `DELETE /organizations/{organizationId}/assets/{assetId}`
- `PATCH /organizations/{organizationId}`

Order 6: Members
- `GET /organizations/{organizationId}/members`
- `POST /organizations/{organizationId}/members`
- `PATCH /organizations/{organizationId}/members/{membershipId}`
- `DELETE /organizations/{organizationId}/members/{membershipId}`

---

## 3. Priority Classification

### Must Have API

Auth:
- `POST /auth/login`
- `POST /auth/logout`
- `GET /users/me`

Organization:
- `GET /organizations`
- `POST /organizations`
- `GET /organizations/{organizationId}`

Template:
- `GET /organizations/{organizationId}/templates`
- `POST /organizations/{organizationId}/templates`
- `GET /organizations/{organizationId}/templates/{templateId}`
- `PUT /organizations/{organizationId}/templates/{templateId}`
- `DELETE /organizations/{organizationId}/templates/{templateId}`

WorshipDocument:
- `GET /organizations/{organizationId}/worship-documents`
- `POST /organizations/{organizationId}/worship-documents`
- `GET /organizations/{organizationId}/worship-documents/{documentId}`
- `PUT /organizations/{organizationId}/worship-documents/{documentId}`
- `DELETE /organizations/{organizationId}/worship-documents/{documentId}`

UploadedAsset:
- `POST /organizations/{organizationId}/assets`

### Should Have API

User:
- `PATCH /users/me`

Organization:
- `PATCH /organizations/{organizationId}`

Membership:
- `GET /organizations/{organizationId}/members`
- `POST /organizations/{organizationId}/members`
- `PATCH /organizations/{organizationId}/members/{membershipId}`
- `DELETE /organizations/{organizationId}/members/{membershipId}`

UploadedAsset:
- `GET /organizations/{organizationId}/assets`
- `GET /organizations/{organizationId}/assets/{assetId}`
- `DELETE /organizations/{organizationId}/assets/{assetId}`

### Nice To Have API

Auth:
- `POST /auth/refresh`

Organization:
- `DELETE /organizations/{organizationId}`

WorshipDocument:
- `POST /organizations/{organizationId}/worship-documents/{documentId}/duplicate`
- `POST /organizations/{organizationId}/worship-documents/{documentId}/export`

Template:
- `POST /organizations/{organizationId}/templates/{templateId}/duplicate`

UploadedAsset:
- `POST /organizations/{organizationId}/assets/presign`

---

## 4. Common Schemas

### Schema: ErrorResponse

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request.",
    "details": [
      {
        "field": "name",
        "message": "Name is required."
      }
    ],
    "requestId": "req_01HX0000000000000000000000"
  }
}
```

Error Codes:
- `unauthorized`
- `forbidden`
- `not_found`
- `validation_error`
- `conflict`
- `rate_limited`
- `internal_error`

HTTP Status Rules:
- `400`: malformed request or invalid field value.
- `401`: missing/invalid token.
- `403`: valid token but missing permission.
- `404`: resource not found or hidden by organization scope.
- `409`: conflict, duplicate slug/email/current membership.
- `422`: semantically invalid JSONB payload.
- `500`: unexpected server error.

### Schema: Pagination

Request Query:

```text
?limit=20&cursor=eyJ1cGRhdGVkQXQiOiIyMDI2LTA2LTA0VDA3OjAwOjAwLjAwMFoiLCJpZCI6InV1aWQifQ==
```

Response:

```json
{
  "pagination": {
    "limit": 20,
    "nextCursor": "eyJ1cGRhdGVkQXQiOiIyMDI2LTA2LTA0VDA3OjAwOjAwLjAwMFoiLCJpZCI6InV1aWQifQ==",
    "hasMore": true
  }
}
```

Pagination Rules:
- Default `limit`: 20.
- Max `limit`: 100.
- Use cursor pagination for list endpoints.
- Sort order:
  - Templates: `updatedAt DESC, id DESC`.
  - WorshipDocuments: `updatedAt DESC, id DESC`.
  - Assets: `createdAt DESC, id DESC`.
  - Members: `createdAt DESC, id DESC`.

### Schema: User

```json
{
  "id": "3d493c73-f923-4c97-b5d2-cfd397850c01",
  "email": "demo@church.test",
  "name": "Demo User",
  "lastLoginAt": "2026-06-04T07:00:00.000Z",
  "createdAt": "2026-06-04T07:00:00.000Z",
  "updatedAt": "2026-06-04T07:00:00.000Z"
}
```

### Schema: MembershipRole

Allowed Values:
- `owner`
- `admin`
- `editor`
- `viewer`

### Schema: MembershipStatus

Allowed Values:
- `invited`
- `active`
- `removed`

### Schema: PresentationSettings

```json
{
  "aspectRatio": "16:9",
  "logoEnabled": true,
  "logoAssetId": "e31a2f52-1f30-43b2-befd-42b9e01ce6da",
  "logoPosition": "top-right"
}
```

Validation:
- `aspectRatio`: `16:9` or `4:3`.
- `logoPosition`: `top-left`, `top-right`, `bottom-left`, `bottom-right`.
- `logoAssetId`: nullable UUID.

### Schema: Module

```json
{
  "id": "praise_01HX0000000000000000000000",
  "type": "praise",
  "collapsed": false,
  "style": {
    "fontFamily": "Malgun Gothic",
    "fontSize": 44,
    "fontWeight": 800,
    "lineHeight": 1.18,
    "letterSpacing": 0,
    "textColor": "#FFFFFF",
    "textAlign": "center",
    "background": "#121212"
  },
  "searchQuery": "Grace",
  "selectedId": "praise-1",
  "customText": "",
  "splitMode": "4"
}
```

Validation:
- `type`: `praise`, `hymn`, `bible`, `sermon`, `announcement`, `custom`.
- Module schema is validated in application code.
- Unknown fields may be accepted for forward compatibility.

### Schema: TemplateSnapshot

```json
{
  "schemaVersion": 1,
  "name": "Sunday Worship",
  "moduleOrder": ["praise_01", "bible_01"],
  "moduleTypes": ["praise", "bible"],
  "selectedModuleId": "praise_01",
  "selectedSlideId": "praise_01-slide-0",
  "presentationSettings": {
    "aspectRatio": "16:9",
    "logoEnabled": false,
    "logoAssetId": null,
    "logoPosition": "top-right"
  },
  "modules": []
}
```

---

## 5. Authorization Matrix

Organization Role Requirements:

| Action | Owner | Admin | Editor | Viewer |
| ------ | ----- | ----- | ------ | ------ |
| View organization | Yes | Yes | Yes | Yes |
| Update organization | Yes | Yes | No | No |
| Delete organization | Yes | No | No | No |
| View members | Yes | Yes | Yes | Yes |
| Invite member | Yes | Yes | No | No |
| Update member role | Yes | Yes | No | No |
| Remove member | Yes | Yes | No | No |
| View templates | Yes | Yes | Yes | Yes |
| Create template | Yes | Yes | Yes | No |
| Update template | Yes | Yes | Yes | No |
| Delete template | Yes | Yes | No | No |
| View documents | Yes | Yes | Yes | Yes |
| Create document | Yes | Yes | Yes | No |
| Update document | Yes | Yes | Yes | No |
| Delete document | Yes | Yes | No | No |
| Upload asset | Yes | Yes | Yes | No |
| Delete asset | Yes | Yes | No | No |

Implementation Rule:
- Apply role check after membership check.
- Return `404` instead of `403` when resource belongs to another organization.
- Return `403` when resource exists in current organization but role is insufficient.

---

## 6. Auth API

### POST /auth/login

Priority:
- Must Have.

Purpose:
- Authenticate user and return access token.

Auth:
- Public.

Request:

```json
{
  "email": "demo@church.test",
  "password": "demo1234"
}
```

Response 200:

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "3d493c73-f923-4c97-b5d2-cfd397850c01",
    "email": "demo@church.test",
    "name": "Demo User"
  }
}
```

Error 401:

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Invalid email or password.",
    "requestId": "req_01HX"
  }
}
```

Notes:
- MVP can start with email/password.
- Social login is future scope.

---

### POST /auth/logout

Priority:
- Must Have.

Purpose:
- Revoke current session or refresh token.

Auth:
- Bearer token required.

Request:

```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

Response 204:
- Empty body.

Error 401:

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Authentication required.",
    "requestId": "req_01HX"
  }
}
```

---

### POST /auth/refresh

Priority:
- Nice To Have.

Purpose:
- Refresh access token.

Auth:
- Public with refresh token.

Request:

```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

Response 200:

```json
{
  "accessToken": "eyJhbGciOi...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

---

## 7. User API

### GET /users/me

Priority:
- Must Have.

Purpose:
- Fetch current user and accessible organizations.

Auth:
- Bearer token required.

Request:
- No body.

Response 200:

```json
{
  "user": {
    "id": "3d493c73-f923-4c97-b5d2-cfd397850c01",
    "email": "demo@church.test",
    "name": "Demo User",
    "lastLoginAt": "2026-06-04T07:00:00.000Z",
    "createdAt": "2026-06-04T07:00:00.000Z",
    "updatedAt": "2026-06-04T07:00:00.000Z"
  },
  "organizations": [
    {
      "id": "019ec73c-7110-4866-bfc4-fdd9e9d986ad",
      "name": "City Light Church",
      "slug": "city-light",
      "role": "owner"
    }
  ]
}
```

Error 401:

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Authentication required.",
    "requestId": "req_01HX"
  }
}
```

---

### PATCH /users/me

Priority:
- Should Have.

Purpose:
- Update current user profile.

Auth:
- Bearer token required.

Request:

```json
{
  "name": "Junho Kim"
}
```

Response 200:

```json
{
  "user": {
    "id": "3d493c73-f923-4c97-b5d2-cfd397850c01",
    "email": "demo@church.test",
    "name": "Junho Kim",
    "updatedAt": "2026-06-04T08:00:00.000Z"
  }
}
```

Error 400:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request.",
    "details": [
      {
        "field": "name",
        "message": "Name is required."
      }
    ],
    "requestId": "req_01HX"
  }
}
```

---

## 8. Organization API

### GET /organizations

Priority:
- Must Have.

Purpose:
- List organizations accessible to current user.

Auth:
- Bearer token required.

Authorization:
- Active membership required.

Query:
- `limit`: optional, default 20.
- `cursor`: optional.

Request:

```http
GET /api/v1/organizations?limit=20
```

Response 200:

```json
{
  "data": [
    {
      "id": "019ec73c-7110-4866-bfc4-fdd9e9d986ad",
      "name": "City Light Church",
      "slug": "city-light",
      "role": "owner",
      "defaultPresentationSettings": {
        "aspectRatio": "16:9",
        "logoEnabled": false,
        "logoAssetId": null,
        "logoPosition": "top-right"
      },
      "createdAt": "2026-06-04T07:00:00.000Z",
      "updatedAt": "2026-06-04T07:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "nextCursor": null,
    "hasMore": false
  }
}
```

---

### POST /organizations

Priority:
- Must Have.

Purpose:
- Create organization and owner membership.

Auth:
- Bearer token required.

Authorization:
- Any authenticated user.

Request:

```json
{
  "name": "City Light Church",
  "slug": "city-light",
  "defaultPresentationSettings": {
    "aspectRatio": "16:9",
    "logoEnabled": false,
    "logoAssetId": null,
    "logoPosition": "top-right"
  }
}
```

Response 201:

```json
{
  "organization": {
    "id": "019ec73c-7110-4866-bfc4-fdd9e9d986ad",
    "name": "City Light Church",
    "slug": "city-light",
    "role": "owner",
    "defaultPresentationSettings": {
      "aspectRatio": "16:9",
      "logoEnabled": false,
      "logoAssetId": null,
      "logoPosition": "top-right"
    },
    "createdAt": "2026-06-04T07:00:00.000Z",
    "updatedAt": "2026-06-04T07:00:00.000Z"
  },
  "membership": {
    "id": "a542594f-474c-463c-a7cd-8bf9328c7df7",
    "role": "owner",
    "status": "active"
  }
}
```

Error 409:

```json
{
  "error": {
    "code": "conflict",
    "message": "Organization slug already exists.",
    "details": [
      {
        "field": "slug",
        "message": "Slug must be unique."
      }
    ],
    "requestId": "req_01HX"
  }
}
```

---

### GET /organizations/{organizationId}

Priority:
- Must Have.

Purpose:
- Fetch organization detail.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin, editor, viewer.

Response 200:

```json
{
  "organization": {
    "id": "019ec73c-7110-4866-bfc4-fdd9e9d986ad",
    "name": "City Light Church",
    "slug": "city-light",
    "logoAssetId": "e31a2f52-1f30-43b2-befd-42b9e01ce6da",
    "defaultPresentationSettings": {
      "aspectRatio": "16:9",
      "logoEnabled": true,
      "logoAssetId": "e31a2f52-1f30-43b2-befd-42b9e01ce6da",
      "logoPosition": "top-right"
    },
    "role": "admin",
    "createdAt": "2026-06-04T07:00:00.000Z",
    "updatedAt": "2026-06-04T07:30:00.000Z"
  }
}
```

Error 404:

```json
{
  "error": {
    "code": "not_found",
    "message": "Organization not found.",
    "requestId": "req_01HX"
  }
}
```

---

### PATCH /organizations/{organizationId}

Priority:
- Should Have.

Purpose:
- Update organization name, slug, logo, or default presentation settings.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin.

Request:

```json
{
  "name": "City Light Church",
  "logoAssetId": "e31a2f52-1f30-43b2-befd-42b9e01ce6da",
  "defaultPresentationSettings": {
    "aspectRatio": "4:3",
    "logoEnabled": true,
    "logoAssetId": "e31a2f52-1f30-43b2-befd-42b9e01ce6da",
    "logoPosition": "bottom-right"
  }
}
```

Response 200:

```json
{
  "organization": {
    "id": "019ec73c-7110-4866-bfc4-fdd9e9d986ad",
    "name": "City Light Church",
    "slug": "city-light",
    "logoAssetId": "e31a2f52-1f30-43b2-befd-42b9e01ce6da",
    "defaultPresentationSettings": {
      "aspectRatio": "4:3",
      "logoEnabled": true,
      "logoAssetId": "e31a2f52-1f30-43b2-befd-42b9e01ce6da",
      "logoPosition": "bottom-right"
    },
    "updatedAt": "2026-06-04T08:00:00.000Z"
  }
}
```

Error 403:

```json
{
  "error": {
    "code": "forbidden",
    "message": "Admin role or higher is required.",
    "requestId": "req_01HX"
  }
}
```

Validation:
- If `logoAssetId` is present, asset must belong to same organization.
- `defaultPresentationSettings.logoAssetId` must match accessible asset or null.

---

### DELETE /organizations/{organizationId}

Priority:
- Nice To Have.

Purpose:
- Soft-delete organization.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Role: owner.

Response 204:
- Empty body.

Error 403:

```json
{
  "error": {
    "code": "forbidden",
    "message": "Owner role is required.",
    "requestId": "req_01HX"
  }
}
```

Business Rules:
- Set `organizations.deleted_at`.
- Child resources remain stored.
- Shared links become invalid through organization access check.

---

## 9. Membership API

### GET /organizations/{organizationId}/members

Priority:
- Should Have.

Purpose:
- List organization members.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin, editor, viewer.

Query:
- `limit`
- `cursor`
- `status`: optional. `invited`, `active`, `removed`.

Response 200:

```json
{
  "data": [
    {
      "id": "a542594f-474c-463c-a7cd-8bf9328c7df7",
      "user": {
        "id": "3d493c73-f923-4c97-b5d2-cfd397850c01",
        "email": "demo@church.test",
        "name": "Demo User"
      },
      "role": "owner",
      "status": "active",
      "joinedAt": "2026-06-04T07:00:00.000Z",
      "createdAt": "2026-06-04T07:00:00.000Z",
      "updatedAt": "2026-06-04T07:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "nextCursor": null,
    "hasMore": false
  }
}
```

---

### POST /organizations/{organizationId}/members

Priority:
- Should Have.

Purpose:
- Invite or add member.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin.

Request:

```json
{
  "email": "media@church.test",
  "role": "editor"
}
```

Response 201:

```json
{
  "membership": {
    "id": "4d78963d-cc9e-4a84-97cb-31c4c699942b",
    "organizationId": "019ec73c-7110-4866-bfc4-fdd9e9d986ad",
    "user": {
      "id": "2c5499ff-c5db-4396-a379-513eabf24616",
      "email": "media@church.test",
      "name": "media"
    },
    "role": "editor",
    "status": "invited",
    "createdAt": "2026-06-04T08:00:00.000Z"
  }
}
```

Error 409:

```json
{
  "error": {
    "code": "conflict",
    "message": "User already has a current membership in this organization.",
    "requestId": "req_01HX"
  }
}
```

MVP Note:
- If full Invitation entity is not implemented, this endpoint may create:
  - User placeholder if email does not exist.
  - Membership with `status = invited`.

---

### PATCH /organizations/{organizationId}/members/{membershipId}

Priority:
- Should Have.

Purpose:
- Change member role or status.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin.

Request:

```json
{
  "role": "admin"
}
```

Response 200:

```json
{
  "membership": {
    "id": "4d78963d-cc9e-4a84-97cb-31c4c699942b",
    "role": "admin",
    "status": "active",
    "updatedAt": "2026-06-04T08:05:00.000Z"
  }
}
```

Authorization Rules:
- Admin cannot change Owner role.
- Admin cannot promote user to Owner.
- Owner can change all roles.
- Must not leave organization with zero active owners.

Error 403:

```json
{
  "error": {
    "code": "forbidden",
    "message": "Only owners can modify owner memberships.",
    "requestId": "req_01HX"
  }
}
```

---

### DELETE /organizations/{organizationId}/members/{membershipId}

Priority:
- Should Have.

Purpose:
- Remove member from organization.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin.

Response 204:
- Empty body.

Business Rules:
- Set `memberships.status = removed`.
- Set `memberships.removed_at = now()`.
- Do not delete user.
- Do not delete resources created by removed user.
- Must not remove last active owner.

Error 409:

```json
{
  "error": {
    "code": "conflict",
    "message": "Cannot remove the last active owner.",
    "requestId": "req_01HX"
  }
}
```

---

## 10. Template API

### GET /organizations/{organizationId}/templates

Priority:
- Must Have.

Purpose:
- List organization templates.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin, editor, viewer.

Query:
- `limit`: optional.
- `cursor`: optional.
- `source`: optional. `saved`, `recommended`, `system`.
- `q`: optional name search.

Response 200:

```json
{
  "data": [
    {
      "id": "8c9f742a-d77a-4f52-9717-e7a18481437e",
      "organizationId": "019ec73c-7110-4866-bfc4-fdd9e9d986ad",
      "name": "Sunday Worship",
      "source": "saved",
      "schemaVersion": 1,
      "metadata": {
        "description": "Default Sunday worship flow"
      },
      "createdByUserId": "3d493c73-f923-4c97-b5d2-cfd397850c01",
      "updatedByUserId": "3d493c73-f923-4c97-b5d2-cfd397850c01",
      "createdAt": "2026-06-04T07:00:00.000Z",
      "updatedAt": "2026-06-04T08:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "nextCursor": null,
    "hasMore": false
  }
}
```

Note:
- List response may omit full `snapshot` for performance.
- Use detail endpoint to load full snapshot.

---

### POST /organizations/{organizationId}/templates

Priority:
- Must Have.

Purpose:
- Create template from current builder state.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin, editor.

Request:

```json
{
  "name": "Sunday Worship",
  "source": "saved",
  "schemaVersion": 1,
  "snapshot": {
    "schemaVersion": 1,
    "name": "Sunday Worship",
    "moduleOrder": ["praise_01", "bible_01"],
    "moduleTypes": ["praise", "bible"],
    "selectedModuleId": "praise_01",
    "selectedSlideId": "praise_01-slide-0",
    "presentationSettings": {
      "aspectRatio": "16:9",
      "logoEnabled": false,
      "logoAssetId": null,
      "logoPosition": "top-right"
    },
    "modules": []
  },
  "metadata": {
    "description": "Default Sunday worship flow"
  }
}
```

Response 201:

```json
{
  "template": {
    "id": "8c9f742a-d77a-4f52-9717-e7a18481437e",
    "organizationId": "019ec73c-7110-4866-bfc4-fdd9e9d986ad",
    "name": "Sunday Worship",
    "source": "saved",
    "schemaVersion": 1,
    "snapshot": {
      "schemaVersion": 1,
      "name": "Sunday Worship",
      "moduleOrder": ["praise_01", "bible_01"],
      "moduleTypes": ["praise", "bible"],
      "selectedModuleId": "praise_01",
      "selectedSlideId": "praise_01-slide-0",
      "presentationSettings": {
        "aspectRatio": "16:9",
        "logoEnabled": false,
        "logoAssetId": null,
        "logoPosition": "top-right"
      },
      "modules": []
    },
    "metadata": {
      "description": "Default Sunday worship flow"
    },
    "createdAt": "2026-06-04T08:00:00.000Z",
    "updatedAt": "2026-06-04T08:00:00.000Z"
  }
}
```

Validation:
- `name` required.
- `snapshot` must be JSON object.
- `snapshot.modules` must be array.
- `snapshot.presentationSettings` must be object.

Error 422:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid template snapshot.",
    "details": [
      {
        "field": "snapshot.modules",
        "message": "modules must be an array."
      }
    ],
    "requestId": "req_01HX"
  }
}
```

---

### GET /organizations/{organizationId}/templates/{templateId}

Priority:
- Must Have.

Purpose:
- Fetch full template snapshot.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin, editor, viewer.

Response 200:

```json
{
  "template": {
    "id": "8c9f742a-d77a-4f52-9717-e7a18481437e",
    "organizationId": "019ec73c-7110-4866-bfc4-fdd9e9d986ad",
    "name": "Sunday Worship",
    "source": "saved",
    "schemaVersion": 1,
    "snapshot": {
      "schemaVersion": 1,
      "name": "Sunday Worship",
      "moduleOrder": ["praise_01"],
      "moduleTypes": ["praise"],
      "presentationSettings": {
        "aspectRatio": "16:9",
        "logoEnabled": false,
        "logoAssetId": null,
        "logoPosition": "top-right"
      },
      "modules": []
    },
    "metadata": {},
    "createdAt": "2026-06-04T07:00:00.000Z",
    "updatedAt": "2026-06-04T08:00:00.000Z"
  }
}
```

Error 404:

```json
{
  "error": {
    "code": "not_found",
    "message": "Template not found.",
    "requestId": "req_01HX"
  }
}
```

---

### PUT /organizations/{organizationId}/templates/{templateId}

Priority:
- Must Have.

Purpose:
- Replace template data.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin, editor.

Request:

```json
{
  "name": "Sunday Worship Updated",
  "schemaVersion": 1,
  "snapshot": {
    "schemaVersion": 1,
    "name": "Sunday Worship Updated",
    "moduleOrder": ["praise_01", "sermon_01"],
    "moduleTypes": ["praise", "sermon"],
    "selectedModuleId": "sermon_01",
    "selectedSlideId": "sermon_01-slide-0",
    "presentationSettings": {
      "aspectRatio": "16:9",
      "logoEnabled": true,
      "logoAssetId": "e31a2f52-1f30-43b2-befd-42b9e01ce6da",
      "logoPosition": "top-right"
    },
    "modules": []
  },
  "metadata": {}
}
```

Response 200:

```json
{
  "template": {
    "id": "8c9f742a-d77a-4f52-9717-e7a18481437e",
    "name": "Sunday Worship Updated",
    "schemaVersion": 1,
    "snapshot": {
      "schemaVersion": 1,
      "name": "Sunday Worship Updated",
      "moduleOrder": ["praise_01", "sermon_01"],
      "moduleTypes": ["praise", "sermon"],
      "selectedModuleId": "sermon_01",
      "selectedSlideId": "sermon_01-slide-0",
      "presentationSettings": {
        "aspectRatio": "16:9",
        "logoEnabled": true,
        "logoAssetId": "e31a2f52-1f30-43b2-befd-42b9e01ce6da",
        "logoPosition": "top-right"
      },
      "modules": []
    },
    "updatedAt": "2026-06-04T08:10:00.000Z"
  }
}
```

---

### DELETE /organizations/{organizationId}/templates/{templateId}

Priority:
- Must Have.

Purpose:
- Soft-delete template.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin.

Response 204:
- Empty body.

Error 403:

```json
{
  "error": {
    "code": "forbidden",
    "message": "Admin role or higher is required.",
    "requestId": "req_01HX"
  }
}
```

---

## 11. WorshipDocument API

### GET /organizations/{organizationId}/worship-documents

Priority:
- Must Have.

Purpose:
- List worship documents.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin, editor, viewer.

Query:
- `limit`
- `cursor`
- `status`: optional. `draft`, `ready`, `archived`.
- `q`: optional name search.

Response 200:

```json
{
  "data": [
    {
      "id": "606d39c9-e36f-4f82-befd-4eaf343df5c2",
      "organizationId": "019ec73c-7110-4866-bfc4-fdd9e9d986ad",
      "templateId": "8c9f742a-d77a-4f52-9717-e7a18481437e",
      "name": "2026-06-07 Sunday Worship",
      "status": "draft",
      "moduleCount": 4,
      "slideCount": 12,
      "lastExportedAt": null,
      "createdAt": "2026-06-04T07:00:00.000Z",
      "updatedAt": "2026-06-04T08:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "nextCursor": null,
    "hasMore": false
  }
}
```

Note:
- List response should not include full `modules` unless requested.

---

### POST /organizations/{organizationId}/worship-documents

Priority:
- Must Have.

Purpose:
- Create editable worship document.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin, editor.

Request:

```json
{
  "name": "2026-06-07 Sunday Worship",
  "templateId": "8c9f742a-d77a-4f52-9717-e7a18481437e",
  "modules": [],
  "presentationSettings": {
    "aspectRatio": "16:9",
    "logoEnabled": false,
    "logoAssetId": null,
    "logoPosition": "top-right"
  },
  "slideCache": [],
  "status": "draft"
}
```

Response 201:

```json
{
  "worshipDocument": {
    "id": "606d39c9-e36f-4f82-befd-4eaf343df5c2",
    "organizationId": "019ec73c-7110-4866-bfc4-fdd9e9d986ad",
    "templateId": "8c9f742a-d77a-4f52-9717-e7a18481437e",
    "name": "2026-06-07 Sunday Worship",
    "modules": [],
    "presentationSettings": {
      "aspectRatio": "16:9",
      "logoEnabled": false,
      "logoAssetId": null,
      "logoPosition": "top-right"
    },
    "slideCache": [],
    "status": "draft",
    "createdAt": "2026-06-04T08:00:00.000Z",
    "updatedAt": "2026-06-04T08:00:00.000Z"
  }
}
```

Validation:
- `modules` must be array.
- `presentationSettings` must be object.
- `templateId` must belong to same organization if present.

---

### GET /organizations/{organizationId}/worship-documents/{documentId}

Priority:
- Must Have.

Purpose:
- Fetch full editable worship document.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin, editor, viewer.

Response 200:

```json
{
  "worshipDocument": {
    "id": "606d39c9-e36f-4f82-befd-4eaf343df5c2",
    "organizationId": "019ec73c-7110-4866-bfc4-fdd9e9d986ad",
    "templateId": "8c9f742a-d77a-4f52-9717-e7a18481437e",
    "name": "2026-06-07 Sunday Worship",
    "modules": [
      {
        "id": "praise_01",
        "type": "praise",
        "collapsed": false,
        "style": {}
      }
    ],
    "presentationSettings": {
      "aspectRatio": "16:9",
      "logoEnabled": false,
      "logoAssetId": null,
      "logoPosition": "top-right"
    },
    "slideCache": [],
    "status": "draft",
    "lastExportedAt": null,
    "createdAt": "2026-06-04T07:00:00.000Z",
    "updatedAt": "2026-06-04T08:00:00.000Z"
  }
}
```

---

### PUT /organizations/{organizationId}/worship-documents/{documentId}

Priority:
- Must Have.

Purpose:
- Replace full worship document editor state.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin, editor.

Request:

```json
{
  "name": "2026-06-07 Sunday Worship",
  "modules": [
    {
      "id": "praise_01",
      "type": "praise",
      "collapsed": false,
      "style": {},
      "selectedId": "praise-1"
    }
  ],
  "presentationSettings": {
    "aspectRatio": "4:3",
    "logoEnabled": true,
    "logoAssetId": "e31a2f52-1f30-43b2-befd-42b9e01ce6da",
    "logoPosition": "bottom-left"
  },
  "slideCache": [
    {
      "id": "praise_01-slide-0",
      "moduleId": "praise_01",
      "moduleName": "Praise",
      "localIndex": 0,
      "kind": "lyric",
      "lines": ["Amazing grace"]
    }
  ],
  "status": "draft"
}
```

Response 200:

```json
{
  "worshipDocument": {
    "id": "606d39c9-e36f-4f82-befd-4eaf343df5c2",
    "name": "2026-06-07 Sunday Worship",
    "modules": [
      {
        "id": "praise_01",
        "type": "praise",
        "collapsed": false,
        "style": {},
        "selectedId": "praise-1"
      }
    ],
    "presentationSettings": {
      "aspectRatio": "4:3",
      "logoEnabled": true,
      "logoAssetId": "e31a2f52-1f30-43b2-befd-42b9e01ce6da",
      "logoPosition": "bottom-left"
    },
    "slideCache": [
      {
        "id": "praise_01-slide-0",
        "moduleId": "praise_01",
        "moduleName": "Praise",
        "localIndex": 0,
        "kind": "lyric",
        "lines": ["Amazing grace"]
      }
    ],
    "status": "draft",
    "updatedAt": "2026-06-04T08:20:00.000Z"
  }
}
```

Validation:
- If `presentationSettings.logoAssetId` is present, asset must belong to same organization.
- `modules` must be array.
- Each module must include `id` and `type`.

---

### DELETE /organizations/{organizationId}/worship-documents/{documentId}

Priority:
- Must Have.

Purpose:
- Soft-delete worship document.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin.

Response 204:
- Empty body.

---

### POST /organizations/{organizationId}/worship-documents/{documentId}/duplicate

Priority:
- Nice To Have.

Purpose:
- Duplicate document in same organization.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin, editor.

Request:

```json
{
  "name": "2026-06-07 Sunday Worship Copy"
}
```

Response 201:

```json
{
  "worshipDocument": {
    "id": "30da96f7-0069-48ca-9e22-81ba2152fb8e",
    "name": "2026-06-07 Sunday Worship Copy",
    "status": "draft",
    "createdAt": "2026-06-04T08:30:00.000Z"
  }
}
```

---

## 12. UploadedAsset API

### GET /organizations/{organizationId}/assets

Priority:
- Should Have.

Purpose:
- List uploaded assets.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin, editor, viewer.

Query:
- `limit`
- `cursor`
- `assetType`: optional. `logo`, `background`, `hymn_score`, `custom_image`, `export`.

Response 200:

```json
{
  "data": [
    {
      "id": "e31a2f52-1f30-43b2-befd-42b9e01ce6da",
      "organizationId": "019ec73c-7110-4866-bfc4-fdd9e9d986ad",
      "assetType": "logo",
      "fileName": "logo.png",
      "mimeType": "image/png",
      "url": "https://cdn.example.com/org/logo.png",
      "sizeBytes": 18234,
      "widthPx": 512,
      "heightPx": 512,
      "metadata": {},
      "createdAt": "2026-06-04T08:00:00.000Z",
      "updatedAt": "2026-06-04T08:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "nextCursor": null,
    "hasMore": false
  }
}
```

---

### POST /organizations/{organizationId}/assets

Priority:
- Must Have.

Purpose:
- Upload asset metadata and file.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin, editor.

Content Type:
- `multipart/form-data`

Request:

```http
POST /api/v1/organizations/019ec73c-7110-4866-bfc4-fdd9e9d986ad/assets
Content-Type: multipart/form-data

assetType=logo
file=@logo.png
metadata={"usage":"organization-logo"}
```

Response 201:

```json
{
  "asset": {
    "id": "e31a2f52-1f30-43b2-befd-42b9e01ce6da",
    "organizationId": "019ec73c-7110-4866-bfc4-fdd9e9d986ad",
    "assetType": "logo",
    "fileName": "logo.png",
    "mimeType": "image/png",
    "url": "https://cdn.example.com/org/logo.png",
    "sizeBytes": 18234,
    "checksum": "sha256:abc123",
    "widthPx": 512,
    "heightPx": 512,
    "metadata": {
      "usage": "organization-logo"
    },
    "createdAt": "2026-06-04T08:00:00.000Z",
    "updatedAt": "2026-06-04T08:00:00.000Z"
  }
}
```

Validation:
- File is required.
- `assetType` is required.
- Logo/background/custom image must be image MIME type.
- Max upload size should be configured by backend.

Error 400:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid upload.",
    "details": [
      {
        "field": "file",
        "message": "File is required."
      }
    ],
    "requestId": "req_01HX"
  }
}
```

---

### GET /organizations/{organizationId}/assets/{assetId}

Priority:
- Should Have.

Purpose:
- Fetch asset metadata and URL.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin, editor, viewer.

Response 200:

```json
{
  "asset": {
    "id": "e31a2f52-1f30-43b2-befd-42b9e01ce6da",
    "organizationId": "019ec73c-7110-4866-bfc4-fdd9e9d986ad",
    "assetType": "logo",
    "fileName": "logo.png",
    "mimeType": "image/png",
    "url": "https://cdn.example.com/org/logo.png",
    "sizeBytes": 18234,
    "widthPx": 512,
    "heightPx": 512,
    "metadata": {},
    "createdAt": "2026-06-04T08:00:00.000Z",
    "updatedAt": "2026-06-04T08:00:00.000Z"
  }
}
```

---

### DELETE /organizations/{organizationId}/assets/{assetId}

Priority:
- Should Have.

Purpose:
- Soft-delete asset.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin.

Response 204:
- Empty body.

Business Rules:
- Set `uploaded_assets.deleted_at = now()`.
- If asset is organization logo, unset or reject delete.
- Recommended MVP behavior:
  - If `organizations.logo_asset_id = assetId`, return 409 unless client clears logo first.

Error 409:

```json
{
  "error": {
    "code": "conflict",
    "message": "Asset is currently used as organization logo.",
    "requestId": "req_01HX"
  }
}
```

---

### POST /organizations/{organizationId}/assets/presign

Priority:
- Nice To Have.

Purpose:
- Create direct-upload URL for object storage.

Auth:
- Bearer token required.

Authorization:
- Active membership.
- Roles: owner, admin, editor.

Request:

```json
{
  "assetType": "background",
  "fileName": "background.png",
  "mimeType": "image/png",
  "sizeBytes": 18234
}
```

Response 200:

```json
{
  "upload": {
    "method": "PUT",
    "url": "https://storage.example.com/presigned",
    "headers": {
      "Content-Type": "image/png"
    },
    "storageKey": "organizations/019ec73c/assets/uuid-background.png",
    "expiresAt": "2026-06-04T08:10:00.000Z"
  }
}
```

---

## 13. OpenAPI-Style Path Summary

```yaml
openapi: 3.1.0
info:
  title: Worship PPT Builder Backend MVP API
  version: 0.1.0
servers:
  - url: /api/v1
security:
  - bearerAuth: []
paths:
  /auth/login:
    post:
      priority: must
      auth: public
  /auth/logout:
    post:
      priority: must
      auth: bearer
  /auth/refresh:
    post:
      priority: nice
      auth: refreshToken
  /users/me:
    get:
      priority: must
    patch:
      priority: should
  /organizations:
    get:
      priority: must
    post:
      priority: must
  /organizations/{organizationId}:
    get:
      priority: must
      roles: [owner, admin, editor, viewer]
    patch:
      priority: should
      roles: [owner, admin]
    delete:
      priority: nice
      roles: [owner]
  /organizations/{organizationId}/members:
    get:
      priority: should
      roles: [owner, admin, editor, viewer]
    post:
      priority: should
      roles: [owner, admin]
  /organizations/{organizationId}/members/{membershipId}:
    patch:
      priority: should
      roles: [owner, admin]
    delete:
      priority: should
      roles: [owner, admin]
  /organizations/{organizationId}/templates:
    get:
      priority: must
      roles: [owner, admin, editor, viewer]
    post:
      priority: must
      roles: [owner, admin, editor]
  /organizations/{organizationId}/templates/{templateId}:
    get:
      priority: must
      roles: [owner, admin, editor, viewer]
    put:
      priority: must
      roles: [owner, admin, editor]
    delete:
      priority: must
      roles: [owner, admin]
  /organizations/{organizationId}/worship-documents:
    get:
      priority: must
      roles: [owner, admin, editor, viewer]
    post:
      priority: must
      roles: [owner, admin, editor]
  /organizations/{organizationId}/worship-documents/{documentId}:
    get:
      priority: must
      roles: [owner, admin, editor, viewer]
    put:
      priority: must
      roles: [owner, admin, editor]
    delete:
      priority: must
      roles: [owner, admin]
  /organizations/{organizationId}/assets:
    get:
      priority: should
      roles: [owner, admin, editor, viewer]
    post:
      priority: must
      roles: [owner, admin, editor]
  /organizations/{organizationId}/assets/{assetId}:
    get:
      priority: should
      roles: [owner, admin, editor, viewer]
    delete:
      priority: should
      roles: [owner, admin]
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

---

## 14. Frontend Integration Notes

Frontend State Mapping:
- Current localStorage `state.modules` -> `worshipDocument.modules`.
- Current localStorage `state.presentationSettings` -> `worshipDocument.presentationSettings`.
- Current localStorage template snapshot -> `template.snapshot`.
- Current uploaded logo data URL -> future `UploadedAsset` + `logoAssetId`.

Frontend Save Strategy:
- Autosave is not required in first backend MVP.
- Start with explicit save:
  - Save template.
  - Save worship document.
- Add debounced autosave later.

Frontend Load Strategy:
- Initial app load:
  1. `GET /users/me`
  2. Select organization.
  3. `GET /organizations/{organizationId}`
  4. `GET /organizations/{organizationId}/templates`
  5. `GET /organizations/{organizationId}/worship-documents`

Frontend Export Strategy:
- Current browser PPTX generation can remain frontend-side.
- Backend API stores document state.
- Future server-side export can use `POST /worship-documents/{documentId}/export`.

---

## 15. MVP Validation Summary

Request Validation:
- Reject blank names.
- Reject invalid UUIDs.
- Reject invalid role/status enum values.
- Reject invalid source/status enum values.
- Reject invalid `PresentationSettings`.
- Reject non-array `modules`.
- Reject non-object `snapshot`.
- Reject asset type mismatch.

Authorization Validation:
- Require bearer token for all non-auth endpoints.
- Require active membership for organization-scoped endpoints.
- Enforce role permissions.
- Hide cross-organization resources with 404.

Soft Delete Validation:
- Do not return soft-deleted resources in list/get endpoints.
- Do not allow update/delete of soft-deleted resources.
- Do not allow access to resources under deleted organizations.

Pagination Validation:
- Clamp `limit` to max 100.
- Reject invalid cursor format.
- Return stable ordering with tie-breaker ID.
