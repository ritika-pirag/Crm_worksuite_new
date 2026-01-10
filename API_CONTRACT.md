# 📘 API Contract Documentation

## CRM Worksuite - Complete API Reference

**Last Updated**: 2026-01-05
**API Version**: v1
**Base URL**: `http://localhost:5000/api/v1`

---

## 📋 Table of Contents

1. [Quick Reference](#quick-reference)
2. [Authentication & Authorization](#authentication--authorization)
3. [Standard Response Format](#standard-response-format)
4. [Error Handling](#error-handling)
5. [Middleware Components](#middleware-components)
6. [API Endpoints by Module](#api-endpoints-by-module)
7. [Common Query Parameters](#common-query-parameters)
8. [File Upload Endpoints](#file-upload-endpoints)
9. [API Statistics](#api-statistics)

---

## 🚀 Quick Reference

### Base Configuration
```
Base URL: http://localhost:5000/api/v1
Content-Type: application/json
Authorization: Bearer <jwt-token>
```

### Authentication Header
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Standard Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

---

## 🔐 Authentication & Authorization

### Authentication States

| State | Description | Header Required | Default Behavior |
|-------|-------------|-----------------|------------------|
| **Required** | Must have valid JWT token | Yes | Returns 401 if missing |
| **Optional** | Works with or without token | No | Sets company_id=1 if no token |
| **Public** | No authentication needed | No | Open access |

### Role Hierarchy

```
SUPERADMIN (Level 4)
    └── Full system access across all companies

ADMIN (Level 3)
    └── Company-wide access (limited to their company)

EMPLOYEE (Level 2)
    └── Limited access to assigned resources

CLIENT (Level 1)
    └── Access to own projects/invoices/tasks only
```

### JWT Token Structure

**Generation** (on login):
```javascript
{
  "id": 1,
  "company_id": 1,
  "email": "user@example.com",
  "role": "ADMIN",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Token Expiry**: 24 hours (configurable via JWT_EXPIRES_IN env variable)

---

## 📦 Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Example"
  },
  "message": "Operation completed successfully",
  "count": 1
}
```

### Success Response (List)
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "count": 2,
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### Error Response
```json
{
  "success": false,
  "error": "Detailed error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

---

## ⚙️ Middleware Components

### Authentication Middleware

#### `verifyToken`
Validates JWT token and attaches user info to request.

```javascript
// Usage
router.get('/protected', verifyToken, controller.action);

// Request object after middleware
req.user = {
  id: 1,
  company_id: 1,
  email: "user@example.com",
  role: "ADMIN"
}
```

#### `optionalAuth`
Optional authentication - sets default company_id=1 if no token.

```javascript
// Usage
router.get('/settings', optionalAuth, settingsController.get);

// Without token: req.user.company_id = 1
// With token: req.user.company_id = <from token>
```

### Authorization Middleware

#### `requireRole(roles)`
Restricts access to specific roles.

```javascript
// Single role
router.post('/companies', requireRole('SUPERADMIN'), controller.create);

// Multiple roles
router.get('/dashboard', requireRole(['ADMIN', 'EMPLOYEE']), controller.get);
```

#### `requireOwnData`
Ensures users can only access their own data.

```javascript
router.get('/profile/:id', requireOwnData, controller.getProfile);
// Blocks if req.params.id !== req.user.id
```

#### `requireCompanyAccess`
Ensures admins only access their company data.

```javascript
router.get('/clients', requireCompanyAccess, controller.getAll);
// Automatically filters by req.user.company_id
```

### Module Access Middleware

#### `checkModuleAccess(moduleName)`
Verifies if module is enabled for company.

```javascript
router.get('/leads', checkModuleAccess('leads'), controller.getAll);
// Returns 403 if module_leads = false in settings
```

#### `checkAnyModuleAccess(moduleNames)`
Requires at least one module enabled (OR logic).

```javascript
router.get('/contacts',
  checkAnyModuleAccess(['leads', 'clients']),
  controller.getAll
);
```

#### `checkAllModulesAccess(moduleNames)`
Requires all modules enabled (AND logic).

```javascript
router.get('/reports',
  checkAllModulesAccess(['projects', 'finance']),
  controller.getReport
);
```

### Upload Middleware

#### `uploadSingle(fieldName)`
Single file upload.

```javascript
router.post('/documents', uploadSingle('file'), controller.create);
```

#### `uploadMultiple(fieldName, maxCount)`
Multiple files upload.

```javascript
router.post('/project/:id/files',
  uploadMultiple('files', 10),
  controller.uploadFiles
);
```

---

## 🔗 API Endpoints by Module

### 1. Authentication (`/api/v1/auth`)

All auth endpoints are **PUBLIC** (no authentication required).

#### POST `/api/v1/auth/login`
Login user and get JWT token.

**Request Body**:
```json
{
  "email": "admin@company.com",
  "password": "password123",
  "role": "ADMIN"
}
```

**Response** (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "company_id": 1,
    "name": "John Doe",
    "email": "admin@company.com",
    "role": "ADMIN",
    "company_name": "Acme Corporation"
  }
}
```

**Error Response** (401):
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

#### POST `/api/v1/auth/logout`
Logout user (client-side token removal).

**Auth Required**: No

**Request Body**: None

**Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### GET `/api/v1/auth/me`
Get current logged-in user profile.

**Auth Required**: Optional (uses `optionalAuth` middleware)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "company_id": 1,
    "name": "John Doe",
    "email": "admin@company.com",
    "role": "ADMIN",
    "phone": "+1234567890",
    "department_id": 2,
    "position_id": 3,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### PUT `/api/v1/auth/me`
Update current user profile.

**Auth Required**: Optional

**Request Body**:
```json
{
  "name": "John Updated",
  "phone": "+9876543210",
  "bio": "Senior Developer"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Updated",
    "phone": "+9876543210",
    "bio": "Senior Developer"
  },
  "message": "Profile updated successfully"
}
```

---

#### PUT `/api/v1/auth/change-password`
Change user password.

**Auth Required**: Optional

**Request Body**:
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword456"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```

---

### 2. Dashboard (`/api/v1/dashboard`)

All dashboard endpoints **require authentication** (`verifyToken` middleware).

#### GET `/api/v1/dashboard/superadmin`
Get SuperAdmin dashboard statistics.

**Auth Required**: Yes
**Roles Allowed**: SUPERADMIN

**Response** (200):
```json
{
  "success": true,
  "data": {
    "total_companies": 25,
    "active_companies": 20,
    "total_users": 500,
    "total_revenue": 125000.00,
    "recent_signups": [
      {
        "id": 25,
        "company_name": "New Corp",
        "created_at": "2026-01-05T10:00:00.000Z"
      }
    ],
    "system_stats": {
      "storage_used": "25GB",
      "bandwidth_used": "500GB"
    }
  }
}
```

---

#### GET `/api/v1/dashboard/admin`
Get Admin dashboard statistics.

**Auth Required**: Yes
**Roles Allowed**: SUPERADMIN, ADMIN

**Response** (200):
```json
{
  "success": true,
  "data": {
    "total_projects": 45,
    "active_projects": 12,
    "total_clients": 78,
    "total_employees": 25,
    "pending_tasks": 34,
    "pending_invoices": 8,
    "total_revenue": 456000.00,
    "monthly_revenue": 45000.00,
    "recent_activities": [
      {
        "type": "project_created",
        "description": "New project 'Website Redesign' created",
        "timestamp": "2026-01-05T14:30:00.000Z"
      }
    ],
    "upcoming_deadlines": [
      {
        "project_id": 12,
        "project_name": "Mobile App",
        "deadline": "2026-01-10",
        "days_left": 5
      }
    ]
  }
}
```

---

#### GET `/api/v1/dashboard/employee`
Get Employee dashboard statistics.

**Auth Required**: Yes
**Roles Allowed**: SUPERADMIN, ADMIN, EMPLOYEE

**Response** (200):
```json
{
  "success": true,
  "data": {
    "my_tasks": 12,
    "pending_tasks": 5,
    "completed_tasks": 7,
    "my_projects": 3,
    "today_attendance": {
      "check_in": "09:00:00",
      "check_out": null,
      "hours_worked": 4.5
    },
    "leave_balance": {
      "total": 20,
      "used": 5,
      "remaining": 15
    },
    "upcoming_events": [
      {
        "id": 1,
        "title": "Team Meeting",
        "date": "2026-01-06",
        "time": "10:00:00"
      }
    ]
  }
}
```

---

#### GET `/api/v1/dashboard/client`
Get Client dashboard statistics.

**Auth Required**: Yes
**Roles Allowed**: SUPERADMIN, ADMIN, CLIENT

**Response** (200):
```json
{
  "success": true,
  "data": {
    "my_projects": 5,
    "active_projects": 3,
    "completed_projects": 2,
    "pending_invoices": 2,
    "total_paid": 50000.00,
    "total_outstanding": 15000.00,
    "open_tickets": 1,
    "recent_activities": [
      {
        "type": "invoice_generated",
        "description": "Invoice #INV-001 generated",
        "timestamp": "2026-01-05T12:00:00.000Z"
      }
    ]
  }
}
```

---

#### GET `/api/v1/dashboard/client/work`
Get client work overview.

**Auth Required**: Yes
**Roles Allowed**: SUPERADMIN, ADMIN, CLIENT

**Response** (200):
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": 1,
        "name": "Website Redesign",
        "progress": 75,
        "status": "in_progress",
        "deadline": "2026-02-15"
      }
    ],
    "tasks": [
      {
        "id": 10,
        "title": "Review homepage design",
        "status": "pending",
        "priority": "high",
        "due_date": "2026-01-07"
      }
    ]
  }
}
```

---

#### GET `/api/v1/dashboard/client/finance`
Get client finance overview.

**Auth Required**: Yes
**Roles Allowed**: SUPERADMIN, ADMIN, CLIENT

**Response** (200):
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": 1,
        "invoice_number": "INV-001",
        "amount": 5000.00,
        "status": "pending",
        "due_date": "2026-01-15"
      }
    ],
    "payments": [
      {
        "id": 1,
        "amount": 10000.00,
        "payment_date": "2025-12-25",
        "method": "bank_transfer"
      }
    ],
    "total_billed": 65000.00,
    "total_paid": 50000.00,
    "total_outstanding": 15000.00
  }
}
```

---

#### GET `/api/v1/dashboard/client/announcements`
Get client announcements.

**Auth Required**: Yes
**Roles Allowed**: SUPERADMIN, ADMIN, CLIENT

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Holiday Schedule",
      "content": "Office closed from Jan 10-12",
      "date": "2026-01-05",
      "priority": "high"
    }
  ]
}
```

---

#### GET `/api/v1/dashboard/client/activity`
Get client activity log.

**Auth Required**: Yes
**Roles Allowed**: SUPERADMIN, ADMIN, CLIENT

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "task_completed",
      "description": "Task 'Homepage Design' marked as completed",
      "user": "John Doe",
      "timestamp": "2026-01-05T14:30:00.000Z"
    }
  ]
}
```

---

#### POST `/api/v1/dashboard/todo`
Save todo item.

**Auth Required**: Yes
**Roles Allowed**: All authenticated users

**Request Body**:
```json
{
  "title": "Review project proposal",
  "description": "Check proposal for XYZ client",
  "priority": "high",
  "due_date": "2026-01-10"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Review project proposal",
    "description": "Check proposal for XYZ client",
    "priority": "high",
    "due_date": "2026-01-10",
    "status": "pending",
    "user_id": 1
  },
  "message": "Todo created successfully"
}
```

---

#### PUT `/api/v1/dashboard/todo/:id`
Update todo item.

**Auth Required**: Yes
**Roles Allowed**: All authenticated users

**Request Body**:
```json
{
  "status": "completed"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "completed"
  },
  "message": "Todo updated successfully"
}
```

---

#### DELETE `/api/v1/dashboard/todo/:id`
Delete todo item.

**Auth Required**: Yes
**Roles Allowed**: All authenticated users

**Response** (200):
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

---

#### POST `/api/v1/dashboard/sticky-note`
Save sticky note.

**Auth Required**: Yes
**Roles Allowed**: All authenticated users

**Request Body**:
```json
{
  "content": "Remember to follow up with client",
  "color": "#FFD700"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "Remember to follow up with client",
    "color": "#FFD700",
    "user_id": 1
  },
  "message": "Sticky note created successfully"
}
```

---

### 3. Super Admin (`/api/v1/superadmin`)

All SuperAdmin endpoints require **SUPERADMIN role only**.

#### GET `/api/v1/superadmin/companies`
Get all companies.

**Auth Required**: Yes (SUPERADMIN only)

**Query Parameters**:
- `status` - Filter by status (active, inactive, suspended)
- `package_id` - Filter by package
- `search` - Search by company name
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_name": "Acme Corporation",
      "email": "admin@acme.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "status": "active",
      "package_id": 2,
      "package_name": "Premium",
      "total_employees": 50,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "count": 1,
  "total": 25,
  "page": 1,
  "limit": 10
}
```

---

#### GET `/api/v1/superadmin/companies/:id`
Get company by ID.

**Auth Required**: Yes (SUPERADMIN only)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "company_name": "Acme Corporation",
    "email": "admin@acme.com",
    "phone": "+1234567890",
    "address": "123 Main St, New York, NY",
    "website": "https://acme.com",
    "status": "active",
    "package_id": 2,
    "package_name": "Premium",
    "subscription": {
      "start_date": "2025-01-01",
      "end_date": "2026-01-01",
      "status": "active"
    },
    "statistics": {
      "total_employees": 50,
      "total_clients": 120,
      "total_projects": 45,
      "storage_used": "5GB"
    },
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### POST `/api/v1/superadmin/companies`
Create new company.

**Auth Required**: Yes (SUPERADMIN only)

**Request Body**:
```json
{
  "company_name": "New Tech Inc",
  "email": "admin@newtech.com",
  "password": "securepassword123",
  "phone": "+1987654321",
  "address": "456 Tech Ave",
  "website": "https://newtech.com",
  "package_id": 1,
  "admin_name": "Jane Smith",
  "admin_email": "jane@newtech.com"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 26,
    "company_name": "New Tech Inc",
    "email": "admin@newtech.com",
    "status": "active"
  },
  "message": "Company created successfully"
}
```

---

#### PUT `/api/v1/superadmin/companies/:id`
Update company.

**Auth Required**: Yes (SUPERADMIN only)

**Request Body**:
```json
{
  "company_name": "Updated Tech Inc",
  "phone": "+1555666777",
  "status": "active"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "company_name": "Updated Tech Inc",
    "phone": "+1555666777",
    "status": "active"
  },
  "message": "Company updated successfully"
}
```

---

#### DELETE `/api/v1/superadmin/companies/:id`
Delete company.

**Auth Required**: Yes (SUPERADMIN only)

**Response** (200):
```json
{
  "success": true,
  "message": "Company deleted successfully"
}
```

---

#### GET `/api/v1/superadmin/stats`
Get system statistics.

**Auth Required**: Yes (SUPERADMIN only)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "total_companies": 25,
    "active_companies": 20,
    "suspended_companies": 3,
    "inactive_companies": 2,
    "total_users": 500,
    "total_revenue": 125000.00,
    "monthly_revenue": 12000.00,
    "storage_stats": {
      "total_capacity": "1TB",
      "used": "250GB",
      "available": "750GB"
    },
    "recent_signups": [
      {
        "id": 25,
        "company_name": "New Corp",
        "created_at": "2026-01-05"
      }
    ]
  }
}
```

---

#### GET `/api/v1/superadmin/users`
Get all users across companies.

**Auth Required**: Yes (SUPERADMIN only)

**Query Parameters**:
- `role` - Filter by role (ADMIN, EMPLOYEE, CLIENT)
- `company_id` - Filter by company
- `status` - Filter by status (active, inactive)
- `search` - Search by name or email

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "company_name": "Acme Corporation",
      "name": "John Doe",
      "email": "john@acme.com",
      "role": "ADMIN",
      "status": "active",
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "count": 500,
  "total": 500
}
```

---

#### GET `/api/v1/superadmin/packages`
Get all packages.

**Auth Required**: Yes (SUPERADMIN only)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Basic",
      "price": 99.00,
      "billing_cycle": "monthly",
      "max_employees": 10,
      "max_clients": 50,
      "storage_limit": "10GB",
      "features": [
        "CRM",
        "Projects",
        "Invoicing"
      ],
      "status": "active"
    },
    {
      "id": 2,
      "name": "Premium",
      "price": 299.00,
      "billing_cycle": "monthly",
      "max_employees": 100,
      "max_clients": 500,
      "storage_limit": "100GB",
      "features": [
        "CRM",
        "Projects",
        "Invoicing",
        "HR Management",
        "Reports",
        "API Access"
      ],
      "status": "active"
    }
  ],
  "count": 2
}
```

---

#### POST `/api/v1/superadmin/packages`
Create package.

**Auth Required**: Yes (SUPERADMIN only)

**Request Body**:
```json
{
  "name": "Enterprise",
  "price": 999.00,
  "billing_cycle": "yearly",
  "max_employees": 500,
  "max_clients": 5000,
  "storage_limit": "1TB",
  "features": ["CRM", "Projects", "Invoicing", "HR", "Reports", "API", "Priority Support"],
  "status": "active"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Enterprise",
    "price": 999.00
  },
  "message": "Package created successfully"
}
```

---

#### GET `/api/v1/superadmin/offline-requests`
Get offline registration requests.

**Auth Required**: Yes (SUPERADMIN only)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_name": "Startup Inc",
      "email": "contact@startup.com",
      "phone": "+1222333444",
      "requested_package_id": 1,
      "package_name": "Basic",
      "status": "pending",
      "message": "We would like to use your CRM system",
      "created_at": "2026-01-04T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### POST `/api/v1/superadmin/offline-requests/:id/accept`
Accept company request.

**Auth Required**: Yes (SUPERADMIN only)

**Request Body**:
```json
{
  "package_id": 1,
  "admin_name": "John Startup",
  "admin_email": "john@startup.com",
  "password": "temppassword123"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "company_id": 26,
    "admin_id": 101
  },
  "message": "Company request accepted and account created"
}
```

---

#### POST `/api/v1/superadmin/offline-requests/:id/reject`
Reject company request.

**Auth Required**: Yes (SUPERADMIN only)

**Request Body**:
```json
{
  "reason": "Incomplete information provided"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Company request rejected"
}
```

---

### 4. Users (`/api/v1/users`)

All user endpoints are **PUBLIC** (no authentication required).

#### GET `/api/v1/users`
Get all users.

**Auth Required**: No

**Query Parameters**:
- `company_id` - Filter by company (required)
- `role` - Filter by role (ADMIN, EMPLOYEE, CLIENT)
- `department_id` - Filter by department
- `status` - Filter by status (active, inactive)
- `search` - Search by name or email

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "name": "John Doe",
      "email": "john@company.com",
      "role": "ADMIN",
      "phone": "+1234567890",
      "department_id": 2,
      "department_name": "IT",
      "position_id": 3,
      "position_name": "Manager",
      "status": "active",
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### POST `/api/v1/users`
Create user.

**Auth Required**: No

**Request Body**:
```json
{
  "company_id": 1,
  "name": "Jane Smith",
  "email": "jane@company.com",
  "password": "password123",
  "role": "EMPLOYEE",
  "phone": "+1987654321",
  "department_id": 2,
  "position_id": 5,
  "status": "active"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 26,
    "name": "Jane Smith",
    "email": "jane@company.com",
    "role": "EMPLOYEE"
  },
  "message": "User created successfully"
}
```

---

#### POST `/api/v1/users/:id/reset-password`
Reset user password.

**Auth Required**: No

**Request Body**:
```json
{
  "new_password": "newpassword456"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 5. Leads (`/api/v1/leads`)

All lead endpoints are **PUBLIC** (no authentication required).

#### GET `/api/v1/leads`
Get all leads.

**Auth Required**: No

**Query Parameters**:
- `company_id` - Filter by company (required)
- `status` - Filter by status (new, contacted, qualified, lost, converted)
- `source` - Filter by source (website, referral, social_media, etc.)
- `priority` - Filter by priority (low, medium, high)
- `assigned_user_id` - Filter by assigned user
- `tags` - Filter by tags (comma-separated)
- `search` - Search by name or email
- `start_date` - Filter by created date (from)
- `end_date` - Filter by created date (to)
- `sort_by` - Sort field (default: created_at)
- `sort_order` - Sort order (asc, desc)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "name": "John Prospect",
      "company_name": "Prospect Corp",
      "email": "john@prospect.com",
      "phone": "+1111222333",
      "status": "qualified",
      "source": "website",
      "priority": "high",
      "assigned_user_id": 5,
      "assigned_user_name": "Sales Rep",
      "tags": ["hot-lead", "enterprise"],
      "value": 50000.00,
      "notes": "Interested in premium package",
      "next_follow_up": "2026-01-10",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### GET `/api/v1/leads/:id`
Get lead by ID.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "company_id": 1,
    "name": "John Prospect",
    "company_name": "Prospect Corp",
    "email": "john@prospect.com",
    "phone": "+1111222333",
    "address": "789 Prospect St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "status": "qualified",
    "source": "website",
    "priority": "high",
    "assigned_user_id": 5,
    "assigned_user_name": "Sales Rep",
    "tags": ["hot-lead", "enterprise"],
    "value": 50000.00,
    "notes": "Interested in premium package",
    "next_follow_up": "2026-01-10",
    "activities": [
      {
        "id": 1,
        "type": "call",
        "description": "Initial discovery call",
        "created_at": "2026-01-02T10:00:00.000Z"
      }
    ],
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

---

#### POST `/api/v1/leads`
Create lead.

**Auth Required**: No

**Request Body**:
```json
{
  "company_id": 1,
  "name": "Sarah Prospect",
  "company_name": "Future Tech",
  "email": "sarah@futuretech.com",
  "phone": "+1555777888",
  "status": "new",
  "source": "referral",
  "priority": "medium",
  "assigned_user_id": 5,
  "tags": ["b2b"],
  "value": 25000.00,
  "notes": "Referred by existing client",
  "next_follow_up": "2026-01-08"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Sarah Prospect",
    "email": "sarah@futuretech.com",
    "status": "new"
  },
  "message": "Lead created successfully"
}
```

---

#### PUT `/api/v1/leads/:id`
Update lead.

**Auth Required**: No

**Request Body**:
```json
{
  "status": "contacted",
  "priority": "high",
  "notes": "Had productive follow-up call",
  "next_follow_up": "2026-01-12"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "contacted",
    "priority": "high"
  },
  "message": "Lead updated successfully"
}
```

---

#### DELETE `/api/v1/leads/:id`
Delete lead.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

---

#### GET `/api/v1/leads/overview`
Get leads overview statistics.

**Auth Required**: No

**Query Parameters**:
- `company_id` - Filter by company (required)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "total_leads": 150,
    "by_status": {
      "new": 45,
      "contacted": 30,
      "qualified": 25,
      "lost": 20,
      "converted": 30
    },
    "by_source": {
      "website": 50,
      "referral": 40,
      "social_media": 30,
      "email_campaign": 20,
      "other": 10
    },
    "by_priority": {
      "low": 50,
      "medium": 60,
      "high": 40
    },
    "total_value": 5000000.00,
    "conversion_rate": 20.0
  }
}
```

---

#### POST `/api/v1/leads/:id/convert-to-client`
Convert lead to client.

**Auth Required**: No

**Request Body**:
```json
{
  "client_category_id": 1,
  "payment_terms": "Net 30"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "client_id": 79,
    "client_name": "John Prospect"
  },
  "message": "Lead converted to client successfully"
}
```

---

#### PUT `/api/v1/leads/:id/update-status`
Update lead status.

**Auth Required**: No

**Request Body**:
```json
{
  "status": "qualified"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "qualified"
  },
  "message": "Lead status updated successfully"
}
```

---

#### PUT `/api/v1/leads/:id/labels`
Update lead labels/tags.

**Auth Required**: No

**Request Body**:
```json
{
  "tags": ["hot-lead", "enterprise", "high-value"]
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tags": ["hot-lead", "enterprise", "high-value"]
  },
  "message": "Lead labels updated successfully"
}
```

---

#### GET `/api/v1/leads/contacts`
Get all lead contacts.

**Auth Required**: No

**Query Parameters**:
- `company_id` - Filter by company (required)
- `lead_id` - Filter by lead

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "lead_id": 1,
      "name": "Mike Decision Maker",
      "email": "mike@prospect.com",
      "phone": "+1444555666",
      "position": "CTO",
      "is_primary": true
    }
  ],
  "count": 1
}
```

---

#### POST `/api/v1/leads/contacts`
Create lead contact.

**Auth Required**: No

**Request Body**:
```json
{
  "lead_id": 1,
  "name": "Sarah Influencer",
  "email": "sarah@prospect.com",
  "phone": "+1777888999",
  "position": "VP of Operations",
  "is_primary": false
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 2,
    "lead_id": 1,
    "name": "Sarah Influencer",
    "email": "sarah@prospect.com"
  },
  "message": "Lead contact created successfully"
}
```

---

#### POST `/api/v1/leads/bulk-action`
Perform bulk action on leads.

**Auth Required**: No

**Request Body**:
```json
{
  "lead_ids": [1, 2, 3, 4, 5],
  "action": "update_status",
  "data": {
    "status": "contacted"
  }
}
```

**Actions**: `update_status`, `assign_user`, `add_tags`, `delete`

**Response** (200):
```json
{
  "success": true,
  "message": "Bulk action completed successfully",
  "count": 5
}
```

---

#### POST `/api/v1/leads/import`
Import leads from CSV/Excel.

**Auth Required**: No

**Request Body** (multipart/form-data):
```
file: leads.csv
company_id: 1
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "imported": 50,
    "skipped": 2,
    "errors": [
      {
        "row": 15,
        "error": "Invalid email format"
      }
    ]
  },
  "message": "Leads imported successfully"
}
```

---

### 6. Clients (`/api/v1/clients`)

All client endpoints are **PUBLIC** (no authentication required).

#### GET `/api/v1/clients`
Get all clients.

**Auth Required**: No

**Query Parameters**:
- `company_id` - Filter by company (required)
- `category_id` - Filter by client category
- `status` - Filter by status (active, inactive)
- `assigned_user_id` - Filter by assigned user
- `search` - Search by name or email
- `sort_by` - Sort field (default: created_at)
- `sort_order` - Sort order (asc, desc)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "name": "ABC Corporation",
      "email": "contact@abc.com",
      "phone": "+1234567890",
      "website": "https://abc.com",
      "address": "123 Business St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "category_id": 1,
      "category_name": "Enterprise",
      "status": "active",
      "assigned_user_id": 3,
      "assigned_user_name": "Account Manager",
      "total_projects": 5,
      "total_invoices": 12,
      "total_revenue": 150000.00,
      "created_at": "2025-06-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### GET `/api/v1/clients/:id`
Get client by ID.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "company_id": 1,
    "name": "ABC Corporation",
    "email": "contact@abc.com",
    "phone": "+1234567890",
    "website": "https://abc.com",
    "address": "123 Business St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA",
    "category_id": 1,
    "category_name": "Enterprise",
    "status": "active",
    "assigned_user_id": 3,
    "assigned_user_name": "Account Manager",
    "tax_number": "TAX123456",
    "payment_terms": "Net 30",
    "notes": "Important client - VIP treatment",
    "contacts": [
      {
        "id": 1,
        "name": "John Client",
        "email": "john@abc.com",
        "phone": "+1111222333",
        "position": "CEO",
        "is_primary": true
      }
    ],
    "statistics": {
      "total_projects": 5,
      "active_projects": 2,
      "completed_projects": 3,
      "total_invoices": 12,
      "paid_invoices": 10,
      "pending_invoices": 2,
      "total_revenue": 150000.00,
      "outstanding_amount": 15000.00
    },
    "created_at": "2025-06-01T00:00:00.000Z"
  }
}
```

---

#### POST `/api/v1/clients`
Create client.

**Auth Required**: No

**Request Body**:
```json
{
  "company_id": 1,
  "name": "XYZ Enterprises",
  "email": "contact@xyz.com",
  "phone": "+1987654321",
  "website": "https://xyz.com",
  "address": "456 Corporate Ave",
  "city": "Los Angeles",
  "state": "CA",
  "zip": "90001",
  "country": "USA",
  "category_id": 2,
  "status": "active",
  "assigned_user_id": 3,
  "tax_number": "TAX789012",
  "payment_terms": "Net 15",
  "notes": "New client from referral"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 79,
    "name": "XYZ Enterprises",
    "email": "contact@xyz.com",
    "status": "active"
  },
  "message": "Client created successfully"
}
```

---

#### PUT `/api/v1/clients/:id`
Update client.

**Auth Required**: No

**Request Body**:
```json
{
  "phone": "+1555666777",
  "payment_terms": "Net 30",
  "notes": "Updated payment terms after negotiation"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "phone": "+1555666777",
    "payment_terms": "Net 30"
  },
  "message": "Client updated successfully"
}
```

---

#### DELETE `/api/v1/clients/:id`
Delete client.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

---

#### GET `/api/v1/clients/overview`
Get clients overview statistics.

**Auth Required**: No

**Query Parameters**:
- `company_id` - Filter by company (required)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "total_clients": 78,
    "active_clients": 65,
    "inactive_clients": 13,
    "by_category": {
      "Enterprise": 20,
      "SMB": 40,
      "Startup": 18
    },
    "total_revenue": 5000000.00,
    "outstanding_amount": 250000.00,
    "top_clients": [
      {
        "id": 1,
        "name": "ABC Corporation",
        "revenue": 150000.00
      }
    ]
  }
}
```

---

#### POST `/api/v1/clients/:id/contacts`
Add client contact.

**Auth Required**: No

**Request Body**:
```json
{
  "name": "Sarah Manager",
  "email": "sarah@abc.com",
  "phone": "+1222333444",
  "position": "Project Manager",
  "is_primary": false
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 2,
    "client_id": 1,
    "name": "Sarah Manager",
    "email": "sarah@abc.com"
  },
  "message": "Contact added successfully"
}
```

---

#### GET `/api/v1/clients/:id/contacts`
Get client contacts.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client_id": 1,
      "name": "John Client",
      "email": "john@abc.com",
      "phone": "+1111222333",
      "position": "CEO",
      "is_primary": true
    },
    {
      "id": 2,
      "client_id": 1,
      "name": "Sarah Manager",
      "email": "sarah@abc.com",
      "phone": "+1222333444",
      "position": "Project Manager",
      "is_primary": false
    }
  ],
  "count": 2
}
```

---

#### PUT `/api/v1/clients/:id/contacts/:contactId`
Update client contact.

**Auth Required**: No

**Request Body**:
```json
{
  "phone": "+1333444555",
  "position": "Senior Project Manager"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 2,
    "phone": "+1333444555",
    "position": "Senior Project Manager"
  },
  "message": "Contact updated successfully"
}
```

---

#### DELETE `/api/v1/clients/:id/contacts/:contactId`
Delete client contact.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

---

### 7. Projects (`/api/v1/projects`)

All project endpoints are **PUBLIC** (no authentication required).

#### GET `/api/v1/projects`
Get all projects.

**Auth Required**: No

**Query Parameters**:
- `company_id` - Filter by company (required)
- `status` - Filter by status (not_started, in_progress, on_hold, completed, cancelled)
- `client_id` - Filter by client
- `priority` - Filter by priority (low, medium, high, urgent)
- `project_type` - Filter by project type
- `project_category` - Filter by category
- `assigned_user_id` - Filter by assigned user
- `project_manager_id` - Filter by project manager
- `member_user_id` - Filter by team member
- `start_date` - Filter by start date (from)
- `end_date` - Filter by deadline (to)
- `upcoming` - Get upcoming projects (true/false)
- `progress_min` - Filter by minimum progress (0-100)
- `progress_max` - Filter by maximum progress (0-100)
- `search` - Search by project name
- `sort_by` - Sort field (default: created_at)
- `sort_order` - Sort order (asc, desc)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "project_name": "Website Redesign",
      "client_id": 1,
      "client_name": "ABC Corporation",
      "project_manager_id": 3,
      "project_manager_name": "John Manager",
      "start_date": "2026-01-01",
      "deadline": "2026-02-15",
      "status": "in_progress",
      "priority": "high",
      "project_type": "Web Development",
      "project_category": "Client Project",
      "budget": 50000.00,
      "progress": 45,
      "description": "Complete redesign of company website",
      "team_members": [
        {
          "id": 5,
          "name": "Developer 1"
        },
        {
          "id": 6,
          "name": "Designer 1"
        }
      ],
      "total_tasks": 25,
      "completed_tasks": 12,
      "pending_tasks": 13,
      "created_at": "2025-12-15T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### GET `/api/v1/projects/:id`
Get project by ID.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "company_id": 1,
    "project_name": "Website Redesign",
    "client_id": 1,
    "client_name": "ABC Corporation",
    "project_manager_id": 3,
    "project_manager_name": "John Manager",
    "start_date": "2026-01-01",
    "deadline": "2026-02-15",
    "status": "in_progress",
    "priority": "high",
    "project_type": "Web Development",
    "project_category": "Client Project",
    "budget": 50000.00,
    "hours_allocated": 500,
    "hours_logged": 225,
    "progress": 45,
    "description": "Complete redesign of company website with modern UI/UX",
    "notes": "Client prefers minimalist design",
    "team_members": [
      {
        "id": 5,
        "name": "Developer 1",
        "role": "Frontend Developer"
      },
      {
        "id": 6,
        "name": "Designer 1",
        "role": "UI/UX Designer"
      }
    ],
    "statistics": {
      "total_tasks": 25,
      "completed_tasks": 12,
      "in_progress_tasks": 8,
      "pending_tasks": 5,
      "total_files": 15,
      "total_time_logged": "225:30:00"
    },
    "created_at": "2025-12-15T00:00:00.000Z"
  }
}
```

---

#### POST `/api/v1/projects`
Create project.

**Auth Required**: No

**Request Body**:
```json
{
  "company_id": 1,
  "project_name": "Mobile App Development",
  "client_id": 2,
  "project_manager_id": 3,
  "start_date": "2026-01-15",
  "deadline": "2026-04-30",
  "status": "not_started",
  "priority": "high",
  "project_type": "Mobile Development",
  "project_category": "Client Project",
  "budget": 100000.00,
  "hours_allocated": 1000,
  "description": "Native iOS and Android app development",
  "team_member_ids": [5, 6, 7, 8],
  "notes": "Using React Native framework"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 46,
    "project_name": "Mobile App Development",
    "status": "not_started",
    "client_id": 2
  },
  "message": "Project created successfully"
}
```

---

#### PUT `/api/v1/projects/:id`
Update project.

**Auth Required**: No

**Request Body**:
```json
{
  "status": "in_progress",
  "progress": 15,
  "notes": "Kickoff meeting completed, development started"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 46,
    "status": "in_progress",
    "progress": 15
  },
  "message": "Project updated successfully"
}
```

---

#### DELETE `/api/v1/projects/:id`
Delete project.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

#### GET `/api/v1/projects/:id/members`
Get project team members.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Developer 1",
      "email": "dev1@company.com",
      "role": "Frontend Developer",
      "hours_logged": "120:30:00",
      "tasks_assigned": 10,
      "tasks_completed": 5
    }
  ],
  "count": 1
}
```

---

#### GET `/api/v1/projects/:id/tasks`
Get project tasks.

**Auth Required**: No

**Query Parameters**:
- `status` - Filter by task status
- `assigned_user_id` - Filter by assigned user
- `priority` - Filter by priority

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "project_id": 1,
      "task_name": "Design homepage mockup",
      "assigned_user_id": 6,
      "assigned_user_name": "Designer 1",
      "status": "completed",
      "priority": "high",
      "start_date": "2026-01-02",
      "due_date": "2026-01-05",
      "completed_date": "2026-01-04",
      "progress": 100
    }
  ],
  "count": 1
}
```

---

#### GET `/api/v1/projects/:id/files`
Get project files.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "project_id": 1,
      "filename": "design_mockup_v2.fig",
      "file_size": 2457600,
      "file_type": "figma",
      "uploaded_by": 6,
      "uploaded_by_name": "Designer 1",
      "uploaded_at": "2026-01-04T15:30:00.000Z",
      "file_url": "https://storage.com/files/project1/design_mockup_v2.fig"
    }
  ],
  "count": 1
}
```

---

#### POST `/api/v1/projects/:id/upload`
Upload project file.

**Auth Required**: No

**Request Body** (multipart/form-data):
```
file: design_mockup.fig
uploaded_by: 6
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 2,
    "filename": "design_mockup.fig",
    "file_url": "https://storage.com/files/project1/design_mockup.fig"
  },
  "message": "File uploaded successfully"
}
```

---

#### GET `/api/v1/projects/filters`
Get project filter options.

**Auth Required**: No

**Query Parameters**:
- `company_id` - Company ID (required)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "statuses": ["not_started", "in_progress", "on_hold", "completed", "cancelled"],
    "priorities": ["low", "medium", "high", "urgent"],
    "project_types": ["Web Development", "Mobile Development", "Design", "Consulting"],
    "categories": ["Client Project", "Internal Project", "R&D"],
    "clients": [
      {"id": 1, "name": "ABC Corporation"},
      {"id": 2, "name": "XYZ Enterprises"}
    ],
    "project_managers": [
      {"id": 3, "name": "John Manager"}
    ]
  }
}
```

---

### 8. Tasks (`/api/v1/tasks`)

All task endpoints are **PUBLIC** (no authentication required).

#### GET `/api/v1/tasks`
Get all tasks.

**Auth Required**: No

**Query Parameters**:
- `company_id` - Filter by company (required)
- `project_id` - Filter by project
- `assigned_user_id` - Filter by assigned user
- `status` - Filter by status (pending, in_progress, completed, on_hold, cancelled)
- `priority` - Filter by priority (low, medium, high, urgent)
- `start_date` - Filter by start date (from)
- `due_date` - Filter by due date (to)
- `search` - Search by task name
- `sort_by` - Sort field (default: created_at)
- `sort_order` - Sort order (asc, desc)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "company_id": 1,
      "project_id": 1,
      "project_name": "Website Redesign",
      "task_name": "Design homepage mockup",
      "description": "Create modern homepage design in Figma",
      "assigned_user_id": 6,
      "assigned_user_name": "Designer 1",
      "status": "completed",
      "priority": "high",
      "start_date": "2026-01-02",
      "due_date": "2026-01-05",
      "completed_date": "2026-01-04",
      "progress": 100,
      "estimated_hours": 8,
      "time_logged": "7:30:00",
      "dependencies": [],
      "tags": ["design", "homepage"],
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### GET `/api/v1/tasks/:id`
Get task by ID.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 10,
    "company_id": 1,
    "project_id": 1,
    "project_name": "Website Redesign",
    "task_name": "Design homepage mockup",
    "description": "Create modern homepage design in Figma with responsive layouts",
    "assigned_user_id": 6,
    "assigned_user_name": "Designer 1",
    "created_by": 3,
    "created_by_name": "John Manager",
    "status": "completed",
    "priority": "high",
    "start_date": "2026-01-02",
    "due_date": "2026-01-05",
    "completed_date": "2026-01-04",
    "progress": 100,
    "estimated_hours": 8,
    "time_logged": "7:30:00",
    "dependencies": [],
    "tags": ["design", "homepage"],
    "comments": [
      {
        "id": 1,
        "user_id": 3,
        "user_name": "John Manager",
        "comment": "Great work on the design!",
        "created_at": "2026-01-04T16:00:00.000Z"
      }
    ],
    "files": [
      {
        "id": 5,
        "filename": "homepage_mockup.fig",
        "file_url": "https://storage.com/files/tasks/homepage_mockup.fig"
      }
    ],
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

---

#### POST `/api/v1/tasks`
Create task (with optional file upload).

**Auth Required**: No

**Request Body** (multipart/form-data):
```json
{
  "company_id": 1,
  "project_id": 1,
  "task_name": "Implement contact form",
  "description": "Create responsive contact form with validation",
  "assigned_user_id": 5,
  "status": "pending",
  "priority": "medium",
  "start_date": "2026-01-08",
  "due_date": "2026-01-12",
  "estimated_hours": 6,
  "tags": ["development", "forms"]
}
```

Optional file field: `file`

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 26,
    "task_name": "Implement contact form",
    "assigned_user_id": 5,
    "status": "pending"
  },
  "message": "Task created successfully"
}
```

---

#### PUT `/api/v1/tasks/:id`
Update task (with optional file upload).

**Auth Required**: No

**Request Body**:
```json
{
  "status": "in_progress",
  "progress": 50
}
```

Optional file field: `file`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 26,
    "status": "in_progress",
    "progress": 50
  },
  "message": "Task updated successfully"
}
```

---

#### DELETE `/api/v1/tasks/:id`
Delete task.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

#### GET `/api/v1/tasks/:id/comments`
Get task comments.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "task_id": 10,
      "user_id": 3,
      "user_name": "John Manager",
      "comment": "Great work on the design!",
      "created_at": "2026-01-04T16:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### POST `/api/v1/tasks/:id/comments`
Add task comment.

**Auth Required**: No

**Request Body**:
```json
{
  "user_id": 5,
  "comment": "Working on the implementation now"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 2,
    "task_id": 26,
    "user_id": 5,
    "comment": "Working on the implementation now"
  },
  "message": "Comment added successfully"
}
```

---

#### GET `/api/v1/tasks/:id/files`
Get task files.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "task_id": 10,
      "filename": "homepage_mockup.fig",
      "file_size": 1536000,
      "uploaded_by": 6,
      "uploaded_by_name": "Designer 1",
      "uploaded_at": "2026-01-04T14:00:00.000Z",
      "file_url": "https://storage.com/files/tasks/homepage_mockup.fig"
    }
  ],
  "count": 1
}
```

---

#### POST `/api/v1/tasks/:id/files`
Upload task file.

**Auth Required**: No

**Request Body** (multipart/form-data):
```
file: document.pdf
uploaded_by: 5
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 6,
    "filename": "document.pdf",
    "file_url": "https://storage.com/files/tasks/document.pdf"
  },
  "message": "File uploaded successfully"
}
```

---

### 9. Invoices (`/api/v1/invoices`)

All invoice endpoints are **PUBLIC** (no authentication required).

#### GET `/api/v1/invoices`
Get all invoices.

**Auth Required**: No

**Query Parameters**:
- `company_id` - Filter by company (required)
- `client_id` - Filter by client
- `project_id` - Filter by project
- `status` - Filter by status (draft, sent, paid, partially_paid, overdue, cancelled)
- `start_date` - Filter by invoice date (from)
- `end_date` - Filter by invoice date (to)
- `search` - Search by invoice number
- `sort_by` - Sort field (default: created_at)
- `sort_order` - Sort order (asc, desc)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "invoice_number": "INV-2026-001",
      "client_id": 1,
      "client_name": "ABC Corporation",
      "project_id": 1,
      "project_name": "Website Redesign",
      "invoice_date": "2026-01-01",
      "due_date": "2026-01-15",
      "subtotal": 10000.00,
      "tax_percentage": 10,
      "tax_amount": 1000.00,
      "discount_percentage": 5,
      "discount_amount": 500.00,
      "total_amount": 10500.00,
      "paid_amount": 5000.00,
      "balance": 5500.00,
      "status": "partially_paid",
      "currency": "USD",
      "notes": "Payment for Phase 1 completion",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### GET `/api/v1/invoices/:id`
Get invoice by ID.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "company_id": 1,
    "invoice_number": "INV-2026-001",
    "client_id": 1,
    "client_name": "ABC Corporation",
    "client_email": "contact@abc.com",
    "client_address": "123 Business St, New York, NY 10001",
    "project_id": 1,
    "project_name": "Website Redesign",
    "invoice_date": "2026-01-01",
    "due_date": "2026-01-15",
    "items": [
      {
        "id": 1,
        "item_name": "UI/UX Design",
        "description": "Homepage and inner pages design",
        "quantity": 40,
        "unit_price": 100.00,
        "total": 4000.00
      },
      {
        "id": 2,
        "item_name": "Frontend Development",
        "description": "HTML/CSS/React implementation",
        "quantity": 60,
        "unit_price": 100.00,
        "total": 6000.00
      }
    ],
    "subtotal": 10000.00,
    "tax_percentage": 10,
    "tax_amount": 1000.00,
    "discount_percentage": 5,
    "discount_amount": 500.00,
    "total_amount": 10500.00,
    "paid_amount": 5000.00,
    "balance": 5500.00,
    "status": "partially_paid",
    "currency": "USD",
    "notes": "Payment for Phase 1 completion",
    "terms_conditions": "Payment due within 15 days",
    "payments": [
      {
        "id": 1,
        "amount": 5000.00,
        "payment_date": "2026-01-05",
        "payment_method": "bank_transfer",
        "transaction_id": "TXN123456"
      }
    ],
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

---

#### POST `/api/v1/invoices`
Create invoice.

**Auth Required**: No

**Request Body**:
```json
{
  "company_id": 1,
  "client_id": 2,
  "project_id": 2,
  "invoice_date": "2026-01-06",
  "due_date": "2026-01-20",
  "items": [
    {
      "item_name": "Mobile App Development",
      "description": "iOS and Android app development",
      "quantity": 200,
      "unit_price": 150.00
    }
  ],
  "tax_percentage": 10,
  "discount_percentage": 0,
  "currency": "USD",
  "notes": "Milestone 1 payment",
  "terms_conditions": "Payment due within 15 days"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 13,
    "invoice_number": "INV-2026-013",
    "client_id": 2,
    "total_amount": 33000.00,
    "status": "draft"
  },
  "message": "Invoice created successfully"
}
```

---

#### PUT `/api/v1/invoices/:id`
Update invoice.

**Auth Required**: No

**Request Body**:
```json
{
  "status": "sent",
  "notes": "Invoice sent to client via email"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 13,
    "status": "sent"
  },
  "message": "Invoice updated successfully"
}
```

---

#### DELETE `/api/v1/invoices/:id`
Delete invoice.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "message": "Invoice deleted successfully"
}
```

---

#### POST `/api/v1/invoices/create-from-time-logs`
Create invoice from time logs.

**Auth Required**: No

**Request Body**:
```json
{
  "company_id": 1,
  "client_id": 1,
  "project_id": 1,
  "time_log_ids": [1, 2, 3, 4, 5],
  "hourly_rate": 100.00,
  "invoice_date": "2026-01-06",
  "due_date": "2026-01-20",
  "tax_percentage": 10
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 14,
    "invoice_number": "INV-2026-014",
    "total_hours": 45.5,
    "total_amount": 5005.00
  },
  "message": "Invoice created from time logs successfully"
}
```

---

#### POST `/api/v1/invoices/create-recurring`
Create recurring invoice.

**Auth Required**: No

**Request Body**:
```json
{
  "company_id": 1,
  "client_id": 1,
  "invoice_template_id": 1,
  "frequency": "monthly",
  "start_date": "2026-02-01",
  "end_date": "2026-12-31",
  "day_of_month": 1
}
```

**Frequency options**: `weekly`, `monthly`, `quarterly`, `yearly`

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "frequency": "monthly",
    "next_invoice_date": "2026-02-01"
  },
  "message": "Recurring invoice created successfully"
}
```

---

#### POST `/api/v1/invoices/:id/send-email`
Send invoice email to client.

**Auth Required**: No

**Request Body**:
```json
{
  "to": "contact@abc.com",
  "cc": ["manager@abc.com"],
  "subject": "Invoice INV-2026-001",
  "message": "Please find attached invoice for services rendered."
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Invoice sent successfully"
}
```

---

#### GET `/api/v1/invoices/:id/pdf`
Generate invoice PDF.

**Auth Required**: No

**Query Parameters**:
- `download` - Download PDF (true/false)

**Response**: PDF file download or URL

```json
{
  "success": true,
  "data": {
    "pdf_url": "https://storage.com/invoices/INV-2026-001.pdf"
  }
}
```

---

### 10. Settings (`/api/v1/settings`)

All settings endpoints are **PUBLIC** (no authentication required).

#### GET `/api/v1/settings`
Get all settings.

**Auth Required**: No (uses `optionalAuth`)

**Query Parameters**:
- `company_id` - Filter by company (default: 1)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "setting_key": "company_name",
      "setting_value": "Acme Corporation",
      "category": "general"
    },
    {
      "id": 2,
      "company_id": 1,
      "setting_key": "theme_mode",
      "setting_value": "dark",
      "category": "ui_options"
    }
  ],
  "count": 80
}
```

---

#### GET `/api/v1/settings/category/:category`
Get settings by category.

**Auth Required**: No

**Categories**: `general`, `localization`, `email`, `ui_options`, `module`, `notifications`, `integrations`, `cron_job`, `access_permission`, etc.

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "setting_key": "theme_mode",
      "setting_value": "dark",
      "category": "ui_options"
    },
    {
      "id": 3,
      "setting_key": "primary_color",
      "setting_value": "#6366F1",
      "category": "ui_options"
    }
  ],
  "count": 6
}
```

---

#### GET `/api/v1/settings/:key`
Get single setting by key.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "company_id": 1,
    "setting_key": "company_name",
    "setting_value": "Acme Corporation",
    "category": "general"
  }
}
```

---

#### PUT `/api/v1/settings`
Update single setting (with optional logo upload).

**Auth Required**: No

**Request Body**:
```json
{
  "setting_key": "company_name",
  "setting_value": "Acme Corp Updated"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "setting_key": "company_name",
    "setting_value": "Acme Corp Updated"
  },
  "message": "Setting updated successfully"
}
```

**Validation Errors** (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "setting_key": "company_email",
      "error": "must be a valid email address"
    }
  ]
}
```

---

#### PUT `/api/v1/settings/bulk`
Bulk update settings.

**Auth Required**: No

**Request Body**:
```json
{
  "settings": [
    {
      "setting_key": "theme_mode",
      "setting_value": "light"
    },
    {
      "setting_key": "primary_color",
      "setting_value": "#3B82F6"
    },
    {
      "setting_key": "module_leads",
      "setting_value": "true"
    }
  ]
}
```

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "setting_key": "theme_mode",
      "setting_value": "light"
    },
    {
      "setting_key": "primary_color",
      "setting_value": "#3B82F6"
    },
    {
      "setting_key": "module_leads",
      "setting_value": "true"
    }
  ],
  "count": 3,
  "message": "3 settings updated successfully"
}
```

---

#### POST `/api/v1/settings/initialize`
Initialize default settings.

**Auth Required**: No

**Query Parameters**:
- `company_id` - Company ID (default: 1)

**Response** (200):
```json
{
  "success": true,
  "message": "Default settings initialized successfully",
  "count": 80
}
```

---

#### POST `/api/v1/settings/reset`
Reset all settings to default values.

**Auth Required**: No

**Query Parameters**:
- `company_id` - Company ID (default: 1)

**Response** (200):
```json
{
  "success": true,
  "message": "Settings reset to defaults successfully",
  "count": 80
}
```

---

#### GET `/api/v1/settings/export`
Export all settings as JSON.

**Auth Required**: No

**Query Parameters**:
- `company_id` - Company ID (default: 1)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "company_name": "Acme Corporation",
    "system_name": "CRM Worksuite",
    "theme_mode": "dark",
    "primary_color": "#6366F1",
    "module_leads": "true",
    "module_clients": "true"
  },
  "count": 80
}
```

---

#### POST `/api/v1/settings/import`
Import settings from JSON.

**Auth Required**: No

**Request Body**:
```json
{
  "settings": {
    "company_name": "Imported Company",
    "theme_mode": "light",
    "primary_color": "#3B82F6"
  }
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Settings imported successfully",
  "count": 3
}
```

---

#### DELETE `/api/v1/settings/:key`
Delete setting.

**Auth Required**: No

**Response** (200):
```json
{
  "success": true,
  "message": "Setting deleted successfully"
}
```

---

## 📊 Common Query Parameters

### Pagination
```
page=1          // Page number (default: 1)
limit=10        // Items per page (default: 10)
```

### Filtering
```
company_id=1    // Filter by company (required for most endpoints)
status=active   // Filter by status
search=keyword  // Search by name/title
start_date=2026-01-01   // Date range start
end_date=2026-01-31     // Date range end
```

### Sorting
```
sort_by=created_at      // Sort field
sort_order=desc         // Sort order (asc, desc)
```

### Example:
```
GET /api/v1/leads?company_id=1&status=qualified&priority=high&search=tech&sort_by=created_at&sort_order=desc&page=1&limit=20
```

---

## 📁 File Upload Endpoints

### Endpoints with File Upload

| Module | Endpoint | Field Name | Max Size | Allowed Types |
|--------|----------|------------|----------|---------------|
| Projects | POST /projects/:id/upload | file | 10MB | All |
| Tasks | POST /tasks | file | 5MB | All |
| Tasks | PUT /tasks/:id | file | 5MB | All |
| Tasks | POST /tasks/:id/files | file | 5MB | All |
| Documents | POST /documents | file | 10MB | PDF, DOC, DOCX, XLS, XLSX |
| Items | POST /items | image | 2MB | JPG, PNG, GIF |
| Items | PUT /items/:id | image | 2MB | JPG, PNG, GIF |
| Settings | PUT /settings | logo | 1MB | JPG, PNG, SVG |

### File Upload Example

**Using multipart/form-data**:

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('uploaded_by', 5);

fetch('http://localhost:5000/api/v1/tasks/10/files', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

**Using cURL**:

```bash
curl -X POST http://localhost:5000/api/v1/tasks/10/files \
  -F "file=@document.pdf" \
  -F "uploaded_by=5"
```

---

## 📊 API Statistics

### Total Endpoints: 240+

### By Authentication Type:
- **Authenticated (JWT Required)**: 38 endpoints
  - Dashboard: 12 endpoints
  - Super Admin: 26 endpoints

- **Optional Authentication**: 5 endpoints
  - Auth /me, /change-password
  - All settings endpoints (default company_id=1)

- **Public (No Auth Required)**: 197+ endpoints
  - All other modules

### By Module:
1. **Authentication**: 5 endpoints
2. **Dashboard**: 12 endpoints
3. **Super Admin**: 26 endpoints
4. **Users**: 3 endpoints
5. **Leads**: 15 endpoints
6. **Clients**: 10 endpoints
7. **Projects**: 9 endpoints
8. **Tasks**: 9 endpoints
9. **Invoices**: 9 endpoints
10. **Estimates**: 8 endpoints
11. **Proposals**: 10 endpoints
12. **Orders**: 7 endpoints
13. **Contracts**: 7 endpoints
14. **Payments**: 6 endpoints
15. **Expenses**: 7 endpoints
16. **Employees**: 8 endpoints
17. **Attendance**: 7 endpoints
18. **Time Tracking**: 6 endpoints
19. **Leave Requests**: 5 endpoints
20. **Events**: 6 endpoints
21. **Tickets**: 6 endpoints
22. **Messages**: 6 endpoints
23. **Notes**: 5 endpoints
24. **Notifications**: 7 endpoints
25. **Documents**: 5 endpoints
26. **Items**: 5 endpoints
27. **Settings**: 10 endpoints
28. **Departments**: 5 endpoints
29. **Positions**: 5 endpoints
30. **Companies**: 5 endpoints
31. **Packages**: 5 endpoints
32. **Subscriptions**: 4 endpoints
33. **Bank Accounts**: 5 endpoints
34. **Credit Notes**: 5 endpoints
35. **Reports**: 5 endpoints
36. **Email Templates**: 5 endpoints
37. **Finance Templates**: 6 endpoints
38. **Social Media**: 7 endpoints
39. **Custom Fields**: 2 endpoints
40. **Audit Logs**: 3 endpoints

### HTTP Methods Distribution:
- GET: ~120 endpoints (50%)
- POST: ~60 endpoints (25%)
- PUT/PATCH: ~40 endpoints (17%)
- DELETE: ~20 endpoints (8%)

---

## 🔴 Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required",
  "message": "No token provided"
}
```

```json
{
  "success": false,
  "error": "Invalid token",
  "message": "Token has expired"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied",
  "message": "You do not have permission to access this resource"
}
```

```json
{
  "success": false,
  "error": "Module disabled",
  "message": "The leads module is currently disabled"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found",
  "message": "Project with ID 999 not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred. Please try again later."
}
```

---

## 📌 Important Notes

### 🔒 Security Considerations

1. **CRITICAL**: Most endpoints are currently **PUBLIC** (no authentication)
   - This is a **MAJOR SECURITY ISSUE**
   - Production deployment MUST add authentication middleware
   - Refer to [COMPLETE_SOFTWARE_AUDIT_REPORT.md](COMPLETE_SOFTWARE_AUDIT_REPORT.md) for security fixes

2. **Authentication should be added to**:
   - All user endpoints
   - All CRM endpoints (leads, clients, projects, tasks)
   - All finance endpoints (invoices, payments, expenses)
   - All HR endpoints (employees, attendance, leaves)
   - All other business endpoints

3. **Module Access Control**:
   - Use `checkModuleAccess` middleware to protect module endpoints
   - Example: `router.get('/leads', checkModuleAccess('leads'), controller.getAll)`

4. **Company Isolation**:
   - Always filter by `company_id` in controllers
   - Use `requireCompanyAccess` middleware for multi-tenant isolation

### 🚨 Known Issues

1. **No Authentication** on 197+ endpoints - **CRITICAL**
2. **No Authorization** checks - **CRITICAL**
3. **No Input Validation** in most controllers - **HIGH**
4. **No Rate Limiting** - **HIGH**
5. **Default company_id=1** fallback - **MEDIUM**
6. **Module access not applied** to routes - **MEDIUM**

### ✅ Recommendations

1. **Immediate Actions**:
   - Add `verifyToken` middleware to ALL business endpoints
   - Add role-based authorization using `requireRole`
   - Implement input validation in all controllers
   - Add rate limiting middleware

2. **Best Practices**:
   - Always include `Authorization: Bearer <token>` header
   - Filter all queries by `company_id` from `req.user.company_id`
   - Validate all user inputs before database operations
   - Use parameterized queries to prevent SQL injection
   - Log all API access for audit trails

3. **Module Protection**:
   ```javascript
   // Example: Protecting leads endpoint
   router.get('/leads',
     verifyToken,                    // 1. Authenticate
     requireRole(['ADMIN', 'EMPLOYEE']), // 2. Authorize
     checkModuleAccess('leads'),     // 3. Check module
     leadsController.getAll          // 4. Execute
   );
   ```

---

## 📚 Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and flows
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Project overview and tech stack
- [COMPLETE_SOFTWARE_AUDIT_REPORT.md](COMPLETE_SOFTWARE_AUDIT_REPORT.md) - Full audit report with 43 issues
- [SETTINGS_COMPLETE_IMPLEMENTATION.md](SETTINGS_COMPLETE_IMPLEMENTATION.md) - Settings system documentation

---

## 📞 Support

For API issues or questions:
- Check the audit report for known issues
- Review architecture documentation for request flow
- Verify authentication and authorization middleware
- Test with proper JWT tokens

---

**Document Version**: 1.0
**Last Updated**: 2026-01-05
**Status**: ⚠️ Development - NOT Production Ready

---

_Generated for CRM Worksuite API Documentation_
